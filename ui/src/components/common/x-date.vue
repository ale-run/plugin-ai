<template>
  <span class="cursor-default" v-html="formatted || ''" v-tooltip="`${dataTooltip && toTooltipString(value)}`"></span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import dateformat from 'dateformat';
import relativeDate from 'tiny-relative-date';
import relativeDateFactory from 'tiny-relative-date/lib/factory';
import ko from './tiny-relative-date/ko';
import ja from './tiny-relative-date/ja';

const relativeDateKo = relativeDateFactory(ko);
const relativeDateJa = relativeDateFactory(ja);

const reldates = {
  en: relativeDate,
  ja: relativeDateJa,
  ko: relativeDateKo
};

const isisodate = (value: string): boolean => {
  return !!(
    value &&
    typeof value === 'string' &&
    (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value) || /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(value))
  );
};

@Component
export default class XDate extends Vue {
  @Prop({ required: true }) public value!: string | Date;
  @Prop({ default: true }) public dataTooltip!: boolean;
  @Prop() public def!: string;
  @Prop() public format!: string;

  public formatted: string = null;
  public interval;

  @Watch('value')
  @Watch('def')
  @Watch('format')
  public calc() {
    const value = this.value;
    const format = this.format;

    if (!value || (typeof value === 'string' && !isisodate(value))) return value || this.def || '';

    if (~['rel', 'relative'].indexOf(format)) this.formatted = (reldates[this.$i18n.locale || 'en'] || relativeDate)(value);
    else this.formatted = dateformat(new Date(this.value), this.format || 'yyyy.mm.dd HH:MM:ss');
  }

  public mounted() {
    this.calc();
    this.watch();
  }

  public destroyed() {
    this.unwatch();
  }

  public watch() {
    this.unwatch();
    if (!~['rel', 'relative'].indexOf(this.format)) return;
    this.interval = setInterval(async () => {
      if (!document.body.contains(this.$el)) return this.unwatch();
      if (document.visibilityState === 'hidden' || document.hidden === true) return;

      this.calc();
    }, 60000);
  }

  public unwatch() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  public toTooltipString(date: Date | string, format?: string): string {
    if (!date) return '';
    if (isisodate(date as string)) return dateformat(new Date(date), format || 'yyyy.mm.dd HH:MM:ss');
    if (date instanceof Date) return dateformat(date, format || 'yyyy.mm.dd HH:MM:ss');
    return `${date}` || '';
  }
}
</script>
