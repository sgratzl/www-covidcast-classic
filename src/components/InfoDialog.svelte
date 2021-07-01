<script>
  /*global UIkit*/
  import { onMount } from 'svelte';
  import { signalCasesOrDeathOptions, currentInfoSensor } from '../stores';

  let dialog;
  onMount(() => {
    UIkit.util.on(dialog, 'hidden', () => {
      // unset upon hidden
      currentInfoSensor.set(null);
    });
  });
</script>

<div id="info-dialog" data-uk-modal bind:this={dialog}>
  <div class="uk-modal-dialog uk-margin-auto-vertical" data-uk-overflow-auto>
    <button class="uk-modal-close-default" type="button" data-uk-close title="Close this popup" />
    <div class="uk-modal-header">
      <h2 class="uk-modal-title">
        {#if $currentInfoSensor}
          {typeof $currentInfoSensor.mapTitleText === 'function'
            ? $currentInfoSensor.mapTitleText($signalCasesOrDeathOptions)
            : $currentInfoSensor.mapTitleText}
        {:else}No Sensor selected{/if}
      </h2>
    </div>
    <div class="uk-modal-body">
      <p>
        {#if $currentInfoSensor}
          {@html $currentInfoSensor.description || 'No description available'}
        {:else}No description available{/if}
      </p>
    </div>
    <div class="uk-modal-footer">
      <ul class="links">
        {#if $currentInfoSensor}
          {#each $currentInfoSensor.links as link}
            <li>
              {@html link}
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  </div>
</div>

<style>
</style>
