<template>
  <div
    class="x-iconbox text-active flex items-center justify-center relative"
    @click="onClick"
    :class="{
      'x-iconbox-xl': size === 'xl',
      'x-iconbox-lg': size === 'lg',
      'x-iconbox-sm': size === 'sm',
      'x-iconbox-xs': size === 'xs',
      'x-iconbox-2xs': size === '2xs',
      'x-iconbox-3xs': size === '3xs',
      'x-iconbox-md': size === 'md',
      'radius-circle': calcshape === 'circle',
      'radius-smooth': calcshape === 'smooth'
    }"
    :style="{
      'color': (icon && icon.foreground) || 'auto',
      'background-color': (icon && icon.background) || 'auto'
    }"
  >
    <img
      v-if="icon"
      :src="icon.src"
      :style="{
        margin: '0 auto',
        width: `${100 * (icon.scale || 1)}%`,
        height: (icon.scale && `${100 * icon.scale}%`) || 'auto'
      }"
    />
    <slot v-if="!icon">
      <div
        class="absolute top-0 left-0 bottom-0 right-0 flex justify-center items-center text-center text-white font-medium"
        :class="`${bg.bg || 'bg-gray-500/30'} ${bg.fg || 'text-white'}`"
      >
        <span class="text-2xs" v-if="size === '2xs'">{{ character }}</span>
        <span class="text-xs" v-else-if="size === 'xs'">{{ character }}</span>
        <span class="text-sm" v-else-if="size === 'sm'">{{ character }}</span>
        <span class="text-2xl" v-else-if="text.length > 6">{{ character }}</span>
        <span class="text-base" v-else>{{ character }}</span>
      </div>
    </slot>
    <slot name="acc"></slot>
    <span
      class="hidden bg-green-500 bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-emerald-500 bg-pink-500 bg-cyan-500 bg-blue-500 bg-indigo-500 bg-sky-500 bg-purple-500/30 text-green-500 text-red-500 text-orange-500 text-amber-500 text-yellow-500 text-lime-500 text-emerald-500 text-pink-500 text-cyan-500 text-blue-500 text-indigo-500 text-sky-500 text-white"
    ></span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Icon } from '@ale-run/connector';

import text2color from '@/components/common/text2color';

@Component
export default class XIcon extends Vue {
  @Prop() public icon?: Icon;
  @Prop({ default: '' }) public text?: string;
  @Prop({ default: 'xl' }) public size?: string;
  @Prop() public shape?: string;
  @Prop() public app?: string;

  public get character() {
    return (this.text && this.text[0]?.toUpperCase()) || '';
  }

  public get bg() {
    return text2color(this.text);
  }

  public get calcshape(): string {
    return this.shape || this.icon?.shape || 'circle';
  }

  public onClick(e) {
    this.$emit('click', e);
  }
}
</script>
