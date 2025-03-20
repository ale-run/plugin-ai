<template>
  <div
    @dragover.stop="onDragOver"
    @dragleave.stop="onDragLeave"
    @drop.stop="onDrop"
    class="border"
    :class="{
      'border-info border-dashed rounded opacity-50': dragover,
      'border-transparent': !dragover
    }"
  >
    <div v-for="(row, index) in rows" :key="index">
      <div class="block md:inline-flex w-full">
        <div class="flex-1 md:mr-1">
          <div
            class="x-form-control px-0 cursor-pointer relative"
            :class="{
              error: row.error
            }"
          >
            <input
              class="x-form-control border-0 m-0 w-full text-xs"
              type="text"
              placeholder="Name"
              @keydown="trimName(row)"
              v-model="row.name"
              :class="{
                error: row.error
              }"
            />
            <div class="absolute x-form-control-inner border-0 right-3 top-0" v-tooltip="`${row.error}`" v-if="row.error">
              <IconInfo class="text-danger text-lg" />
            </div>
          </div>
        </div>
        <div class="flex flex-1 items-center mb-1">
          <div
            class="flex-1 x-form-control pl-0 cursor-pointer"
            :class="{
              error: row.error
            }"
          >
            <div class="px-3 flex-1">
              <input
                class="x-form-control border-0 m-0 p-0 w-full outline-none x-input text-sm"
                type="text"
                placeholder="Value"
                v-model="row.value"
                @click.stop
                @blur="toggleMask(row)"
                v-if="!row.value || !row.masked"
              />
              <input
                class="x-form-control border-0 m-0 p-0 w-full outline-none x-input text-sm cursor-pointer"
                type="text"
                placeholder="Value"
                :value="maskValue(row.value)"
                readonly
                @click.stop="toggleMask(row)"
                v-else
              />
            </div>
          </div>
        </div>
        <div class="inline-flex">
          <!-- <input class="x-form-control flex-1" type="text" placeholder="Value" v-model="row.value" v-if="row.value" /> -->
          <a class="text-info hover:text-primary text-xl mx-2 cursor-pointer flex items-center" @click="createRow(row)"><IconPlus /></a>
          <a class="text-warning hover:text-danger text-xl mr-2 cursor-pointer flex items-center" @click="removeRow(row)"><IconMinus /></a>
        </div>
      </div>
    </div>

    <div class="my-3 flex items-center">
      <div class="flex-1">
        <a class="cursor-pointer text-primary hover:text-info text-xs font-medium" @click="reset">
          <IconReset class="mr-1" />
          {{ $t('XVariables.reset') }}
        </a>
      </div>
      <div class="px-2">
        <a class="cursor-pointer text-primary hover:text-info text-xs font-medium" @click="download">
          <IconDownload class="mr-1" />
          {{ $t('XVariables.download') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue, Watch } from 'vue-property-decorator';
import { Properties, FormErrors, RegExps, Workbench } from '@ale-run/connector';

import dotenv from 'dotenv';
import readFiles from '../common/readFiles';
import downloadFile from '../common/downloadFile';

import IconPlus from 'bootstrap-icons/icons/plus-circle.svg';
import IconMinus from 'bootstrap-icons/icons/dash-circle.svg';
import IconKey from 'bootstrap-icons/icons/key.svg';
import IconDownload from 'bootstrap-icons/icons/download.svg';
import IconReset from 'bootstrap-icons/icons/arrow-clockwise.svg';
import IconInfo from 'bootstrap-icons/icons/info-circle-fill.svg';

@Component({
  components: {
    IconPlus,
    IconMinus,
    IconKey,
    IconDownload,
    IconReset,
    IconInfo
  }
})
export default class XVariables extends Vue {
  @VModel({ type: Object }) public data!: Properties;

  public original: Properties = null;
  public rows: Array<{
    name: string;
    value?: string;
    masked?: boolean;
    error?: string;
  }> = [];
  public interval = null;
  public loaded = false;
  public errors: FormErrors = new FormErrors();
  public dragover = false;

  public async mounted() {
    this.original = (this.data && JSON.parse(JSON.stringify(this.data))) || {};
    this.reset();
  }

  public destroy() {
    if (this.interval) clearInterval(this.interval);
  }

  public reset() {
    const rows = Object.keys(this.original || {}).map((name) => {
      return { name, value: this.original[name] || '', masked: true };
    });
    if (!rows?.length) rows.push({ name: '', value: '', masked: false });

    this.rows = rows;
  }

  public createRow(row) {
    this.errors.clear();
    if (row && ~this.rows.indexOf(row)) this.rows.splice(this.rows.indexOf(row) + 1, 0, { name: '', value: '' });
    else this.rows.push({ name: '', value: '' });
  }

  public removeRow(row) {
    ~this.rows.indexOf(row) && this.rows.splice(this.rows.indexOf(row), 1);
    if (!this.rows.length) this.rows.push({ name: '', value: '' });
  }

  public setValue(row, value?: string) {
    row.secret = null;
    row.var = null;
    row.value = value || row.value;
    this.watchData();
    this.$forceUpdate();
  }

  public trimName(row) {
    if (row.name) row.name = row.name?.split(' ').join('') || '';
  }

  public toggleMask(row) {
    row.masked = !row.masked;
    this.$forceUpdate();
  }

  public maskValue(value) {
    if (!value) return '';
    return '•'.repeat(value?.length);
  }

  public onDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    if (~e.dataTransfer.types.indexOf('Files')) this.dragover = true;
  }

  public onDragLeave() {
    this.dragover = false;
  }

  public async onDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();

    this.dragover = false;

    const env = {};

    (await readFiles(e.dataTransfer)).forEach((text: string) => {
      try {
        const o = dotenv.parse(text);
        Object.assign(env, o);
      } catch (err) {
        Workbench.toast({ message: err.message, type: 'error' });
      }
    });

    Object.keys(env).forEach((name) => {
      const row = this.rows.find((r) => r.name === name);
      const value = env[name];
      if (row) {
        row.value = value;
        row.masked = true;
      } else {
        this.rows.push({ name, value, masked: true });
      }
    });

    for (const row of this.rows) {
      if (!row || !row?.name) {
        this.rows.splice(this.rows.indexOf(row), 1);
      }
    }

    this.validate();
  }

  public async download() {
    const contents = [];
    this.rows?.forEach((row) => {
      if (!row.name) return;
      const value = (row.value || '').trim();
      if (~value.indexOf('\n') || ~value.indexOf('=') || ~value.indexOf(' ') || ~value.indexOf('#')) {
        contents.push(`${row.name.trim()}="${value}"`);
      } else {
        contents.push(`${row.name.trim()}=${value}`);
      }
    });

    downloadFile(`variables.properties`, contents.join(`\n`));
  }

  @Watch('rows', { deep: true })
  public validate() {
    const rows = this.rows;

    rows?.forEach((row) => {
      if (row.name) row.name = row.name?.trim() || '';

      if (!row.name && row.value) {
        row.error = this.$t('XVariables.errors.variablenameisrequired')?.toString();
        return;
      } else if (row.name && !RegExps.variableName.regexp.test(row.name)) {
        row.error = this.$t('XVariables.errors.invalidvariablename')?.toString();
        return;
      }

      row.error = null;
    });
  }

  @Watch('rows', { deep: true })
  public watchData() {
    const data = {};

    this.rows.forEach((row) => {
      const name = row.name?.trim();
      if (!name || !RegExps.variableName.regexp.test(name)) return null;
      data[name] = row.value || '';
    });

    this.data = data;
    // setTimeout(() => {
    //   console.log('watch', JSON.stringify(this.data, null, 2));
    // }, 100);
  }
}
</script>
