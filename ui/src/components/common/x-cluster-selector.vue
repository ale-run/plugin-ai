<template>
  <div class="relative">
    <XSpinner v-if="!clusters" />

    <template v-if="dataList">
      <div class="x-dropdown block">
        <div
          class="x-form-control cursor-pointer"
          :class="{
            'grayscale': selected && selected.assignable === false,
            'opacity-50': selected && selected.assignable === false
          }"
        >
          <XClusterIcon class="mr-3" size="2xs" :provider="selected && selected.information && selected.information.provider" />
          <div class="flex-1">
            <div class="font-medium text-sm" v-if="selected">
              {{ selected.displayName || selected.name }}
              <small class="text-light">{{ selected.name }}</small>
            </div>
            <div class="font-medium text-sm" v-else>
              {{ $t('XClusterSelector.selectacluster') }}
            </div>
          </div>
          <div class="x-caret x-caret-down"></div>
        </div>

        <div class="x-dropdown-items w-full">
          <div class="x-contextmenu text-sm px-0 max-h-200 md:max-h-250 overflow-auto overscroll-contain">
            <div class="x-list x-list-hover min-w-200">
              <div class="x-list-header" v-if="clusters && clusters.length">{{ $t('XClusterSelector.selectacluster') }}</div>
              <a class="x-list-item" v-else>
                <div class="flex-1 font-medium text-muted text-xs text-center">{{ $t('XClusterSelector.nocluster') }}</div>
              </a>
              <template v-for="cluster in clusters">
                <a
                  class="x-list-item"
                  :class="{
                    'cursor-pointer': cluster.assignable !== false
                  }"
                  v-if="cluster.listing !== false"
                  :key="cluster.name"
                  @click="selectCluster(cluster.name)"
                >
                  <div
                    class="flex items-center font-medium"
                    :class="{
                      'grayscale': cluster.assignable === false,
                      'opacity-50': cluster.assignable === false
                    }"
                  >
                    <XClusterIcon class="mr-3" size="2xs" :provider="cluster.information && cluster.information.provider" />
                    {{ cluster.displayName || cluster.name }}
                    <small class="text-light ml-1" v-if="cluster.assignable === false">{{ $t('XClusterSelector.maintenance') }}</small>
                  </div>
                </a>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="!dataList">
      <div v-if="clusters && clusters.length">
        <div :class="`grid grid-cols-${dataCols || 4} gap-1`">
          <template v-for="cluster in clusters">
            <div
              class="rounded-lg cursor-pointer text-center radius-sm transition-all duration-300 py-5"
              :class="selected && selected.name === cluster.name && 'bg-info border-info text-white'"
              :key="cluster.name"
              v-if="cluster.listing !== false"
              @click="selectCluster(cluster.name)"
            >
              <XClusterIcon
                class="mx-auto"
                :class="{
                  'grayscale': cluster.assignable === false,
                  'opacity-50': cluster.assignable === false
                }"
                size="sm"
                :provider="cluster.information && cluster.information.provider"
              />
              <div class="mt-2 text-center">
                <span
                  class="font-semibold text-xs cursor-pointer"
                  :class="{
                    'text-muted': cluster.assignable === false
                  }"
                  v-html="getClusterDisplayName(cluster)"
                ></span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, VModel } from 'vue-property-decorator';
import { connector, ClusterInfo } from '@ale-run/connector';
import { isEqual } from 'underscore';

import XSpinner from '../common/x-spinner.vue';
import XClusterIcon from '../common/x-cluster-icon.vue';
import IconAle from '@/assets/logo/ale.svg';
import IconAWS from '@/assets/logo/provider/aws.svg';
import IconGCP from '@/assets/logo/provider/googlecloud.svg';
import IconAzure from '@/assets/logo/provider/azure.svg';
import IconTencent from '@/assets/logo/provider/tencentcloud.svg';
import IconDigitalOcean from '@/assets/logo/provider/digitalocean.svg';
import IconKubernetes from '@/assets/logo/dev/kubernetes.svg';

@Component({
  components: {
    XSpinner,
    XClusterIcon,
    IconAle,
    IconAWS,
    IconGCP,
    IconAzure,
    IconTencent,
    IconDigitalOcean,
    IconKubernetes
  }
})
export default class XClusterSelector extends Vue {
  @Prop({ required: true }) public dataScope!: string;
  @Prop({ type: Boolean, default: false }) public dataList!: boolean;
  @Prop({ type: Number, default: 4 }) public dataCols!: number;
  @VModel({ type: Object }) public data!: ClusterInfo;

  public clusters: ClusterInfo[] = null;
  public selected: ClusterInfo = null;

  @Watch('dataScope')
  public async reload() {
    try {
      const scopemgr = await connector.getScopeManager();
      const scope = await scopemgr.getScope(this.dataScope);
      const clusters: ClusterInfo[] = await scope.listClusters();
      const selectedCluster = (this.selected && clusters.find((cluster) => cluster.name === this.selected?.name)) || clusters[0];

      this.clusters = clusters;
      selectedCluster && this.selectCluster(selectedCluster.name);
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
    }
  }

  public async mounted() {
    if (this.dataScope && typeof this.dataScope !== 'string') throw new TypeError(`prop "data-scope" must be a string`);
    this.reload();
  }

  public getClusterDisplayName(cluster) {
    const info = cluster.information || {};
    let result = '';

    if (cluster.displayName) {
      result = cluster.displayName?.split(' - ').join('<br>');
    } else if (info.provider) {
      let provider = info.provider;
      if (provider === 'aws') provider = 'AWS';
      else if (provider === 'gcp') provider = 'Google Cloud';
      else if (provider === 'azure') provider = 'MS Azure';

      if (info.country && info.city) result = `${provider}<br>${info.city} ${info.country}`;
      else if (info.country) result = result = `${provider}<br>${info.country}`;
      else if (info.city) result = result = `${provider}<br>${info.city}`;
      else result = `${provider}`;
    } else {
      if (info.country && info.city) result = `${info.city} ${info.country}`;
      else if (info.country) result = info.country;
      else if (info.city) result = info.city;
      else result = cluster.name;
    }

    // if (info.provider) return `${info.provider.toUpperCase()}<br>${result}`;
    return result;
  }

  public selectCluster(name: string) {
    const cluster = this.clusters.find((c) => c.name === name);
    if (cluster.listing === false) return;
    if (cluster.assignable === false) return;
    this.selected = cluster;
    this.$emit('select', {
      cluster
    });
  }

  @Watch('selected', { deep: true })
  public watchData() {
    if (isEqual(this.selected, this.data)) return;
    this.data = this.selected;
  }
}
</script>
