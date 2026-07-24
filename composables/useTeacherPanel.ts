import type { 
  TeacherDashboardResponse, 
  ReviewEssayData,
  Essay,
  ApiResponse
} from '~/types/bible-school'

export const useTeacherPanel = () => {
    const { $api } = useApi();
    
    // Получение дашборда учителя
    const getDashboard = async (): Promise<TeacherDashboardResponse> => {
        return await $api<TeacherDashboardResponse>('/bible-school/teacher/dashboard');
    };
    
    // Одобрить заявку на обучение
    const approveEnrollmentRequest = async (requestId: number): Promise<ApiResponse> => {
        return await $api<ApiResponse>(`/bible-school/enrollment-requests/${requestId}/approve`, {
            method: 'POST'
        });
    };
    
    // Отклонить заявку на обучение
    const rejectEnrollmentRequest = async (requestId: number): Promise<ApiResponse> => {
        return await $api<ApiResponse>(`/bible-school/enrollment-requests/${requestId}/reject`, {
            method: 'POST'
        });
    };
    
    // Получить эссе для проверки
    const getEssay = async (essayId: number): Promise<Essay> => {
        return await $api<Essay>(`/bible-school/my/essays/${essayId}`);
    };
    
    // Отправить проверку эссе
    const reviewEssay = async (essayId: number, data: ReviewEssayData): Promise<ApiResponse> => {
        return await $api<ApiResponse>(`/bible-school/essays/${essayId}/review`, {
            method: 'POST',
            body: data
        });
    };
    
    // Обновить роль студента
    const updateStudentRole = async (userId: number, role: 'student' | 'group_leader'): Promise<ApiResponse> => {
        return await $api<ApiResponse>(`/bible-school/teacher/students/${userId}/role`, {
            method: 'PUT',
            body: { role }
        });
    };
    
    // Отправить сообщение студенту
    const sendMessageToStudent = async (studentId: number, message: string): Promise<ApiResponse> => {
        return await $api<ApiResponse>(`/bible-school/teacher/students/${studentId}/message`, {
            method: 'POST',
            body: { message }
        });
    };
    
    return {
        getDashboard,
        approveEnrollmentRequest,
        rejectEnrollmentRequest,
        getEssay,
        reviewEssay,
        updateStudentRole,
        sendMessageToStudent,
    };
};