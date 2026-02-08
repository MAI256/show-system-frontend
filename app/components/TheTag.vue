<template>
    <div class="tag">
        <slot></slot>
    </div>
</template>

<style scoped>
.tag {
    width: max-content;
    padding: 0.75rem 1.25rem;

    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.625rem;

    z-index: 100;

    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    color: #c1c1c1;

    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(4px);

    transition: opacity 0.3s ease;
}

@media screen and (max-width: 1100px) {
    .tag {
        padding: 0.5rem 1rem;
    }
}
</style>
