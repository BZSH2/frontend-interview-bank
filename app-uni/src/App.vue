<script lang="ts">
export default {
  name: 'App',
};
</script>

<style lang="scss">
page {
  background:
    radial-gradient(circle at top left, rgba(22, 28, 45, 0.04), transparent 28%),
    linear-gradient(180deg, #faf9f7 0%, #f7f5f1 48%, #f8f7f4 100%);
  color: #121826;
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
  color: #121826;
}
</style>
