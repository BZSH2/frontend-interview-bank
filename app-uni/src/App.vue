<script lang="ts">
export default {
  name: 'App',
};
</script>

<style lang="scss">
page {
  background:
    radial-gradient(circle at top left, rgba(124, 77, 255, 0.16), transparent 32%),
    radial-gradient(circle at top right, rgba(69, 196, 255, 0.14), transparent 28%),
    linear-gradient(180deg, #f8f6ff 0%, #f5f4ff 44%, #f9fbff 100%);
  color: #181c2a;
  font-size: 28rpx;
}

view,
text,
navigator,
button,
input,
textarea,
scroll-view {
  box-sizing: border-box;
}

button {
  border: none;
  font-size: 28rpx;
}

button::after {
  border: none;
}

input,
textarea {
  color: #181c2a;
}
</style>
