
const fpsLabel = document.getElementById('fpsLabel')
const canvas = document.getElementById('canvas')
const loader = document.getElementById('loader')
const content = document.getElementById('content')
const loading = document.getElementById('loading')

function init() {
	if (!BABYLON.Engine.isSupported()) {
		document.getElementById('error').style.display = 'block'
		$('#error>.follow').animate({bottom: '0px'}, 'slow')
	}
	else {
		document.getElementById('loader').style.display = 'block'
		$('#loader>.follow').animate({bottom: '0px'}, 'slow', () => {
			Manager.init([loading, canvas, fpsLabel, content, loader])
		})
	}

	menu()
}

function menu() {
	//true change color when is close
	arrows('.footer_click', '.bottom_banner')
	arrows('.header_click', '.top_banner')
	
	showDivInfo('about', false)
	showDivInfo('info', false) 

	$('#vr').click(function(){
		console.log('only free - TODO')
	})
	
	$('#fullscreen').click(function(){
		Manager.switchFullscreen()
	})
	
	$('#sound').click(function(){
		Manager.activateSounds()
	}) 
	
	$('#menu').click(function(){
		
	}) 
}

function showDivInfo(str, param) {
	$('#'+str).click(function(){
		param = !param
		if(param) 
			$('.'+str).animate({bottom: '0px'}, 'slow').show()
		else
			$('.'+str).animate({bottom: -$('.'+str)[0].offsetHeight+'px'}, 'slow',() => { $('.'+str).hide() })
	})
	$('.'+str).click(function(){param = !param$('.'+str).animate({bottom: -$('.'+str)[0].offsetHeight+'px'}, 'slow',() => { $('.'+str).hide() }) })
}

function arrows(str1, str2, changeColor = false) {
	$(str1).click(function(){ 
		if($(str1+' i').hasClass('fa-chevron-circle-right')){
		$(str2).animate({right: -screen.width+'px'}, 'slow', ()=>{
				$(str1+' i').addClass('fa-chevron-circle-left')
				$(str1+' i').removeClass('fa-chevron-circle-right')
				$(str2).hide()
				if(changeColor) $(str1).css('color','black') 				
			})
		}else{
			$(str2).animate({right: '0px'}, 'slow', ()=>{
				$(str1+' i').addClass('fa-chevron-circle-right')
				$(str1+' i').removeClass('fa-chevron-circle-left')
				if(changeColor) $(str1).css('color','white')
			}).show()	
		}
	})
}

window.addEventListener('resize', function () { Manager.resize() })
window.addEventListener('contextmenu', function (e) { e.preventDefault() }, false)

init()
