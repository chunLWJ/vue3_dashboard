
export function fontsize() {

  // 默认是 1.6 em，即 子元素下 1em 都是 16px
  // 16 px 即是 1920
  let appFontSize = Math.ceil(document.documentElement.clientWidth / 120)
  console.log('fontSize',appFontSize)
  // document.getElementById('app').style.fontSize = `${appFontSize / 10}em`
  document.getElementById('app').style.fontSize = `${appFontSize / 8}em`
}
