<template>
  <div class="rich-editor">
    <!-- Панель инструментов -->
    <div class="toolbar bg-white/10 border border-white/20 rounded-t-lg p-2 flex flex-wrap gap-2">
      <button type="button" @click="execCommand('bold')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Жирный">
        <strong>B</strong>
      </button>
      <button type="button" @click="execCommand('italic')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Курсив">
        <em>I</em>
      </button>
      <button type="button" @click="execCommand('underline')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Подчёркнутый">
        <u>U</u>
      </button>
      <span class="w-px h-6 bg-white/20"></span>
      <button type="button" @click="execCommand('insertUnorderedList')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Маркированный список">
        • Список
      </button>
      <button type="button" @click="execCommand('insertOrderedList')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Нумерованный список">
        1. Список
      </button>
      <span class="w-px h-6 bg-white/20"></span>
      <button type="button" @click="execCommand('justifyLeft')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="По левому краю">
        ⬅️
      </button>
      <button type="button" @click="execCommand('justifyCenter')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="По центру">
        ⏺️
      </button>
      <button type="button" @click="execCommand('justifyRight')" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="По правому краю">
        ➡️
      </button>
      <span class="w-px h-6 bg-white/20"></span>
      <button type="button" @click="insertLink" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Вставить ссылку">
        🔗
      </button>
      <button type="button" @click="insertImage" class="px-2 py-1 bg-white/10 rounded hover:bg-white/20" title="Вставить изображение">
        🖼️
      </button>
    </div>

    <!-- Редактор -->
    <div
      ref="editorRef"
      contenteditable="true"
      class="editor bg-white/10 border border-white/20 border-t-0 rounded-b-lg p-3 text-white min-h-[150px] focus:outline-none"
      :data-placeholder="placeholder"
      @input="onInput"
      @blur="onBlur"
      @paste="onPaste"
      @keydown="saveSelection"
      @mouseup="saveSelection"
    ></div>
  </div>
</template>

<script setup>
import DOMPurify from 'isomorphic-dompurify'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Введите текст...'
  }
});

const emit = defineEmits(['update:modelValue']);
const editorRef = ref(null);
let savedSelection = null;

// Сохраняем позицию курсора
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && editorRef.value && editorRef.value.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    savedSelection = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };
  }
};

// Восстанавливаем позицию курсора
const restoreSelection = () => {
  if (!savedSelection || !editorRef.value) return;
  
  try {
    const range = document.createRange();
    range.setStart(savedSelection.startContainer, savedSelection.startOffset);
    range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  } catch (e) {
    // Если восстановить не удалось, ставим курсор в конец
    const range = document.createRange();
    range.selectNodeContents(editorRef.value);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  savedSelection = null;
};

const execCommand = (command, value = null) => {
  saveSelection();
  document.execCommand(command, false, value);
  editorRef.value?.focus();
  restoreSelection();
  emitInput();
};

const insertImage = () => {
  const url = prompt('Введите URL изображения:');
  if (!url) return;

  // Разрешаем только http/https
  if (!/^https?:\/\//i.test(url)) {
    alert('URL изображения должен начинаться с http:// или https://');
    return;
  }

  execCommand('insertImage', url);
};

const insertLink = () => {
  const url = prompt('Введите URL:');
  if (!url) return;

  // Разрешаем только http/https/mailto/tel
  if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
    alert('Разрешены только ссылки http://, https://, mailto: или tel:');
    return;
  }

  execCommand('createLink', url);
};

const emitInput = () => {
  if (editorRef.value) {
    const rawHtml = editorRef.value.innerHTML;
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    if (cleanHtml !== props.modelValue) {
      // Если санитизация что-то вырезала — синхронизируем DOM
      if (cleanHtml !== rawHtml) {
        const selection = window.getSelection();
        const hadFocus = document.activeElement === editorRef.value;
        editorRef.value.innerHTML = cleanHtml;
        if (hadFocus) {
          // Ставим курсор в конец, чтобы не потерять фокус
          const range = document.createRange();
          range.selectNodeContents(editorRef.value);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
      emit('update:modelValue', cleanHtml);
    }
  }
};

const onInput = () => {
  emitInput();
};

const onBlur = () => {
  emitInput();
};

// Обработка вставки: санируем HTML до попадания в редактор
const onPaste = (e) => {
  e.preventDefault();
  const html = e.clipboardData?.getData('text/html');
  const text = e.clipboardData?.getData('text/plain');

  if (html) {
    const clean = DOMPurify.sanitize(html);
    document.execCommand('insertHTML', false, clean);
  } else if (text) {
    document.execCommand('insertText', false, text);
  }
};

// Синхронизация внешнего изменения (без сброса курсора)
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    saveSelection();
    editorRef.value.innerHTML = DOMPurify.sanitize(newVal || '');
    nextTick(() => {
      restoreSelection();
    });
  }
});

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = DOMPurify.sanitize(props.modelValue || '');
    // Добавляем стиль для placeholder
    if (!props.modelValue) {
      editorRef.value.classList.add('empty');
    }
  }
});
</script>

<style scoped>
.rich-editor {
  width: 100%;
}

.editor {
  overflow-y: auto;
}

.editor:empty:before,
.editor.empty:before {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.4);
}

.editor:focus {
  outline: none;
}

.editor img {
  max-width: 100%;
  max-height: 300px;
}

.toolbar button {
  cursor: pointer;
  min-width: 32px;
  transition: all 0.2s;
}

.toolbar button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>