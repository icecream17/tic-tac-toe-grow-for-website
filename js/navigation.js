
const actors = document.getElementsByClassName('navigation-actor')
const targets = document.getElementsByClassName('navigation-target')

console.assert(actors.length === targets.length)
for (let i = 0; i < actors.length; i++) {
   actors[i].onclick = () => {
      targets[i].classList.add('active')
      setTimeout(() => {
         targets[i].classList.remove('active')
      }, 3500)
   }
}
