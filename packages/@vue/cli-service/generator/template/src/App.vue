<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  mounted() {
    document.getElementById("pre-start").style.display = "none"
  }
}
</script>
