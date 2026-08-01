<template>
  <div class="global-container">
    <div class="global-container-inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.global-container {
  width: 100%;
  margin: 0 auto;
}

.global-container-inner {
  width: 100%;
  max-width: 1278px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .global-container {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
  
  .global-container-inner {
    padding: 0;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .global-container-inner {
    max-width: 90%;
  }
}

@media (min-width: 1025px) {
  .global-container {
    display: flex;
    justify-content: center;
  }
}
</style>