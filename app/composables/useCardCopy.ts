import { ref, readonly } from 'vue'

export interface CardCopyData {
  imageIndex: number
  imageSrc: string
  rectWidth: string
  rectHeight: string
}

export function useCardCopy() {
  const showCopy = ref(false)
  const cardData = ref<CardCopyData>({
    imageIndex: 0,
    imageSrc: '',
    rectWidth: '15rem',
    rectHeight: '20rem',
  })

  // Показать копию карточки
  function showCardCopy(data: CardCopyData) {
    cardData.value = data
    showCopy.value = true
  }

  // Скрыть копию карточки
  function hideCardCopy() {
    showCopy.value = false
  }

  // Обработчики для слайдера
  const handleShowCardCopy = (data: CardCopyData) => {
    showCardCopy(data)
  }

  const handleHideCardCopy = () => {
    hideCardCopy()
  }

  return {
    showCopy: readonly(showCopy),
    cardData: readonly(cardData),
    showCardCopy,
    hideCardCopy,
    handleShowCardCopy,
    handleHideCardCopy,
  }
}