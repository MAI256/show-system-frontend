<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  tag: {
    type: String,
    default: 'div'
  },
  lineClass: {
    type: String,
    default: 'split-line'
  },
  lineInnerClass: {
    type: String,
    default: 'split-line-inner'
  }
})

const root = ref<HTMLElement | null>(null)
// We use a key to force re-render if needed, though we will manipulate DOM directly
// for performance in this specific "magic" case.
const resizeObserver = ref<ResizeObserver | null>(null)
let originalContent = ''

const splitText = () => {
  if (!root.value) return
  
  // 1. Restore original content to measure cleanly
  if (!originalContent) {
    originalContent = root.value.innerHTML
  } else {
    root.value.innerHTML = originalContent
  }

  // 2. Wrap every word in a span, leave spaces as text nodes
  const element = root.value
  const textNodes = getTextNodes(element)
  
  textNodes.forEach(node => {
    const text = node.textContent || ''
    if (text.length === 0) return 
    
    const wrapper = document.createDocumentFragment()
    // Split by whitespace, capturing the whitespace
    const tokens = text.split(/(\s+)/)
    
    tokens.forEach(token => {
      if (!token) return
      // Check if token is purely whitespace
      if (/^\s+$/.test(token)) {
        wrapper.appendChild(document.createTextNode(token))
      } else {
        const span = document.createElement('span')
        span.textContent = token
        // Use inline-block or inline? 
        // inline-block allows precise box measurement, but 'inline' is more natural for flow.
        // However, 'inline' elements have working offsetTop.
        // Let's use 'inline-block' for the words to ensure they are atomic units,
        // but since we have real spaces between them, wrapping should work.
        // Actually, let's use 'inline' to be 100% safe about flow not being disrupted by block formatting.
        span.style.display = 'inline-block' 
        span.classList.add('word-measure') 
        wrapper.appendChild(span)
      }
    })
    
    node.parentNode?.replaceChild(wrapper, node)
  })

  // 3. Measure and Group
  // We need to iterate over ALL child nodes to capture spaces too.
  const allNodes = Array.from(element.childNodes)
  if (allNodes.length === 0) return

  const lines: Node[][] = []
  let currentLine: Node[] = []
  let lastTop: number | null = null

  // Helper to find the "top" of a node. 
  // Text nodes don't have offsetTop. We look for the nearest preceding or succeeding element
  // or just assume it belongs to the current line being built.
  
  // We will iterate and only trigger a line break when we hit a measured element 
  // that has a new Y coordinate.
  
  allNodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains('word-measure')) {
      const el = node as HTMLElement
      const top = el.offsetTop
      
      if (lastTop === null) {
        lastTop = top
        currentLine.push(node)
      } else if (Math.abs(top - lastTop) > 5) { 
        // New line detected at this word
        lines.push(currentLine)
        currentLine = [node]
        lastTop = top
      } else {
        // Same line
        currentLine.push(node)
      }
    } else {
      // It's a text node (space) or some other non-measured element.
      // We just append it to the current line.
      // Note: If a space is at the start of a new line (collapsed), 
      // attaching it to the previous line (trailing) is standard.
      currentLine.push(node)
    }
  })
  if (currentLine.length > 0) lines.push(currentLine)

  // 4. Construct Final HTML
  element.innerHTML = ''

  lines.forEach((lineNodes, index) => {
    const lineWrapper = document.createElement('div')
    lineWrapper.className = props.lineClass
    lineWrapper.style.display = 'block'
    lineWrapper.style.setProperty('--line-index', index.toString())

    const lineInner = document.createElement('div')
    lineInner.className = props.lineInnerClass
    lineInner.style.display = 'block'
    
    lineNodes.forEach(node => {
      // If it's a measure span, unwrap it (keep text) or keep it wrapped?
      // Usually we want to keep the word wrapped if we want word-level control later,
      // but the requirement is "split lines".
      // Let's strip the measuring class/styles but keep the text.
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains('word-measure')) {
         lineInner.appendChild(document.createTextNode(node.textContent || ''))
      } else {
         lineInner.appendChild(node.cloneNode(true))
      }
    })
    
    lineWrapper.appendChild(lineInner)
    element.appendChild(lineWrapper)
  })
}

// Helper to get all text nodes
function getTextNodes(el: Node): Node[] {
  const nodes: Node[] = []
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      nodes.push(node)
    } else {
      nodes.push(...getTextNodes(node))
    }
  })
  return nodes
}

// Debounced resize handler
let timeout: NodeJS.Timeout
const handleResize = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    splitText()
  }, 100)
}

onMounted(() => {
  nextTick(() => {
    if (root.value) {
        splitText()
        resizeObserver.value = new ResizeObserver(handleResize)
        resizeObserver.value.observe(root.value)
        // Also observe parent to be safe if root is inline
        if (root.value.parentElement) {
             resizeObserver.value.observe(root.value.parentElement)
        }

        // Listen for text-split-trigger event from scroll animation
        const step = root.value.closest('.step')
        if (step) {
          step.addEventListener('text-split-trigger', () => {
            root.value?.classList.add('animate-text-split')
          })

          step.addEventListener('text-split-reverse', () => {
            root.value?.classList.remove('animate-text-split')
          })
        }
    }
  })
})

onUnmounted(() => {
  resizeObserver.value?.disconnect()
  clearTimeout(timeout)
})

defineExpose({
    splitText
})
</script>

<template>
  <component :is="tag" ref="root" class="text-splitter">
    <slot />
  </component>
</template>

<style scoped>
@import url(~/assets/css/_variables.css);

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.text-splitter :deep(.split-line) {
  overflow: hidden;
}

.text-splitter :deep(.split-line-inner) {
  transform: translateY(100%);
  opacity: 0;
}

.text-splitter.animate-text-split :deep(.split-line-inner) {
  animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media screen and (max-width: $mobile) {
  .text-splitter.animate-text-split :deep(.split-line-inner) {
    animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s;
  }
}
</style>
