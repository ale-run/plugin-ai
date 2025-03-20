<template>
  <div
    class="bg-transparent"
    :class="{
      'x-iconbox': true,
      'x-iconbox-2xs': !size || size === '2xs',
      'x-iconbox-xs': !size || size === 'xs',
      'x-iconbox-sm': !size || size === 'sm',
      'x-iconbox-md': !size || size === 'md',
      'x-iconbox-lg': !size || size === 'lg',
      'x-iconbox-xl': !size || size === 'xl',
      'x-iconbox-2xl': !size || size === '2xl'
    }"
  >
    <img
      :style="{
        width: '100%',
        height: '100%'
      }"
      :src="image"
      v-if="image"
    />
    <IconAWS
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'aws'"
    />
    <IconGCP
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'gcp'"
    />
    <IconNCP
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'ncp'"
    />
    <IconAzure
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'azure'"
    />
    <IconTencent
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'tencent'"
    />
    <IconDigitalOcean
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'digitalocean'"
    />
    <IconKubernetes
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else-if="provider === 'k8s' || provider === 'kubernetes'"
    />
    <IconAle
      :style="{
        width: '100%',
        height: '100%'
      }"
      v-else
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import IconAle from '@/assets/logo/ale.svg';
import IconAWS from '@/assets/logo/provider/aws.svg';
import IconGCP from '@/assets/logo/provider/googlecloud.svg';
import IconNCP from '@/assets/logo/provider/ncp.svg';
import IconAzure from '@/assets/logo/provider/azure.svg';
import IconTencent from '@/assets/logo/provider/tencentcloud.svg';
import IconDigitalOcean from '@/assets/logo/provider/digitalocean.svg';
import IconKubernetes from '@/assets/logo/dev/kubernetes.svg';

@Component({
  components: {
    IconAle,
    IconAWS,
    IconGCP,
    IconNCP,
    IconAzure,
    IconTencent,
    IconDigitalOcean,
    IconKubernetes
  }
})
export default class XClusterIcon extends Vue {
  @Prop() public image!: string;
  @Prop() public provider!: string;
  @Prop() public size?: string;
  @Prop() public shape?: string;
}
</script>
