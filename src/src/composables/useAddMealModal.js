import { ref } from 'vue'

const addMealModalOpen = ref(false)
const mealSavedCount = ref(0)

export function useAddMealModal() {
  function openAddMealModal() {
    addMealModalOpen.value = true
  }

  function closeAddMealModal() {
    addMealModalOpen.value = false
  }

  function notifySaved() {
    mealSavedCount.value++
  }

  return {
    addMealModalOpen,
    mealSavedCount,
    openAddMealModal,
    closeAddMealModal,
    notifySaved
  }
}
