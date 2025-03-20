<template>
  <div class="x-progress-bar overflow-hidden" :class="`x-progress-bar-${color}`">
    <div
      class="x-progress-bar-gauge transition transition-all ease-in-out delay-75"
      :style="{
        width: `${width}%`
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class XProgressBar extends Vue {
  @Prop({ required: true }) public dataValue!: number;
  @Prop({ required: true }) public dataMax!: number;
  @Prop() public dataColor!: string;

  public get color() {
    const color = this.dataColor || 'auto';
    if (color === 'auto') {
      if (this.dataValue <= 0 && this.dataMax <= 0) return 'black';
      else if (this.dataValue > 0 && this.dataMax <= 0) return 'danger';
      else if (this.width > 100) return 'danger';
      else if (this.width > 75) return 'warning';
      else if (this.width > 50) return 'success';
    }
    return color || 'info';
  }

  public get width() {
    if (this.dataValue <= 0 && this.dataMax <= 0) return 0;
    if (this.dataMax <= 0) return 100;
    return Math.round(((this.dataValue / this.dataMax) * 100 || 0) * 100) / 100;
  }
}
</script>
