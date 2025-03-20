<template>
  <span>{{ formatted }}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class XElipsis extends Vue {
  @Prop() public value!: string;
  @Prop({ default: 30 }) public length!: number;

  public get formatted() {
    const value = this.value || '';
    const length = +this.length || 30;
    if (!value) return value;
    if (length < 1) return value;
    if (value.length <= length) return value;
    if (length === 1) return value.substring(0, 1) + '...';

    const midpoint = Math.ceil(value.length / 2);
    const toremove = value.length - length;
    const lstrip = Math.ceil(toremove / 2);
    const rstrip = toremove - lstrip;
    return value.substring(0, midpoint - lstrip) + '...' + value.substring(midpoint + rstrip);
  }
}
</script>
