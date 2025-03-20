<template>
  <div>
    <template v-for="key in keys">
      <a :class="getClassName(key)" :key="key" :alt="getValue(key)">{{ key }}: {{ getValue(key) }}</a>
      <br :key="key + '-br'" v-if="isBreak" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

const types = ['primary', 'info', 'success', 'warning', 'danger', 'system', 'default'];

@Component
export default class XLabels extends Vue {
  @Prop() public break?: boolean;
  @Prop() public cls?: string;
  @Prop() public type?: string;
  @Prop() public value?: {
    [key: string]: string;
  };
  public keys: string[] | null = (this.value && Object.keys(this.value)) || null;
  public isBreak = this.break !== undefined ? true : false;

  public getClassName(key: string): string {
    const cons = key[0] && key[0];
    const code = cons.charCodeAt(0) % types.length;
    return `x-label x-label-${this.type || types[code]}${this.cls ? ' ' + this.cls : ''}`;
  }

  public getValue(key: string): string {
    let value = this.value && this.value[key];
    if (value && typeof value === 'object') value = '(object)';
    return (value && value.toString()) || '';
  }
}
</script>
