<template>
  <div class="input">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="updateValue"
    />
    <img v-if="iconSrc" :src="iconSrc" alt="" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number | undefined;
  type?: string;
  placeholder?: string;
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  placeholder: "",
  icon: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const iconSrc = ref<string>();

watchEffect(async () => {
  if (props.icon) {
    try {
      const module = await import(`~/assets/img/${props.icon}.svg`);
      iconSrc.value = module.default;
    } catch {
      iconSrc.value = undefined;
    }
  } else {
    iconSrc.value = undefined;
  }
});

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<style lang="postcss" scoped>
@import url(~/assets/css/_variables.css);

.input {
  width: 100%;
  height: max-content;

  position: relative;

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);

  input {
    width: 100%;
    height: 100%;

    padding: 1rem 1.25rem;
    padding-right: 3.5rem;

    @mixin text-regular-medium;
    color: #fff;

    background: transparent;
    outline: none;
    border: none;

    &::placeholder {
      color: #ffffff16;
    }
  }

  img {
    width: 1.5rem;
    height: 1.5rem;

    position: absolute;
    top: 50%;
    right: 1.25rem;
    transform: translateY(-50%);

    opacity: 0.3;

    pointer-events: none;
  }
}
</style>
