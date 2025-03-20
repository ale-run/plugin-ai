<template>
  <div>
    <template v-for="(v, index) in value">
      <a :class="getClassName(index)" v-if="v || v === 0" :key="index" :alt="v">{{ v }}</a>
      <br :key="index + '-br'" v-if="isBreak" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

const colors = ['info', 'danger', 'success', 'primary', 'warning', 'system', 'default'];

@Component
export default class XTags extends Vue {
  @Prop() public break!: boolean;
  @Prop() public size!: string;
  @Prop() public color!: string;
  @Prop() public value!: Array<string | number>;
  public isBreak = this.break !== undefined ? true : false;

  public getClassName(index: number): string {
    const cons = this.value && this.value[index];
    const code = cons && (typeof cons === 'number' ? cons : cons.charCodeAt(0)) % colors.length;
    const cls = ` x-label-${this.color || colors[code || 0]} x-label-${this.size || '2xs'}`;
    return `x-label${cls || ''}`;
  }

  public getValue(index: number): string {
    let value = this.value && this.value[index];
    if (value && typeof value === 'object') value = '(object)';
    if (value === 0) value = '0';
    return (value && value.toString()) || '';
  }
}
</script>
