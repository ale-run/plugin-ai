<template>
  <div
    class="relative x-iconbox transition duration-300 overflow-hidden border bg-slate-500/30"
    :class="{
      'x-iconbox-xl': size === 'xl',
      'x-iconbox-lg': size === 'lg',
      'x-iconbox-sm': size === 'sm',
      'x-iconbox-xs': size === 'xs',
      'x-iconbox-2xs': size === '2xs',
      'x-iconbox-3xs': size === '3xs',
      'x-iconbox-md': size === 'md',
      'radius-circle': shape === 'circle',
      'radius-smooth': shape === 'smooth'
    }"
    @click="onClick"
  >
    <div class="absolute top-0 left-0 right-0 bottom-0 flex items-end justify-center opacity-80" v-if="!url">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="currentColor"
        class="block"
        style="margin: -0.3rem;"
        viewBox="0 0 16 16"
      >
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      </svg>
    </div>

    <div class="ratio-1by1 w-full bg-cover" :style="`background-color:#fff;background-image: url(${url});`" v-if="url"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class XAvatar extends Vue {
  @Prop() public url?: string;
  @Prop({ default: '' }) public size?: string;
  @Prop({ default: 'circle' }) public shape?: string;

  public onClick(e) {
    this.$emit('click', e);
  }
}
</script>
