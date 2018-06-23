
const fpsLabel = document.getElementById('fpsLabel')
const canvas = document.getElementById('canvas')
const loader = document.getElementById('loader')
const content = document.getElementById('content')
const loading = document.getElementById('loading')
const vr = document.getElementById('vr')
const control = new Control()

function init() {
	if (!BABYLON.Engine.isSupported()) {
		document.getElementById('error').style.display = 'block'
		$('#error>.follow').animate({bottom: '0px'}, 'slow')
	}
	else {
		document.getElementById('loader').style.display = 'block'
		$('#loader>.follow').animate({bottom: '0px'}, 'slow', () => {
			Manager.init([loading, canvas, fpsLabel, content, loader, vr])

			if (!Manager.isMobile) {
				// $("#tablet").css("color","#7a7a7a").css("cursor","auto");
				$("#ar").css("color","#7a7a7a").css("cursor","auto");
			}
		})
	}

	menu()
}

function menu() {
	arrows('.footer_click', '.bottom_banner')
	arrows('.header_click', '.top_banner')
	
	showDivInfo('about', false)
	showDivInfo('info', false)
	showDivInfo('menu', false)

	$(document).ready(function () {
		$('#ar').click(function(){
			
		})
		
		$('#tablet').click(function(){
			Manager.switchDOCamera()
		})
		
		$('#fullscreen').click(function(){
			Manager.switchFullscreen()
		})
		
		$('#sound').click(function(){
			Manager.toggleSounds()
		}) 
	})
}

function showDivInfo(str, param) {
	$('#'+str).click(function () {
		param = !param;
		if(param) {
			$('.'+str).show()
		} else {
			$('.'+str).hide()
		}
	})
	$('.'+str).click(function () { 
		param = !param; 
		$('.'+str).hide()
	})
}

function arrows(str1, str2) {
	$(str1).click(function(){ 
		if($(str1+' i').hasClass('fa-chevron-circle-right')){
			$(str2).animate({right: -screen.width+'px'}, 'slow', () => {
				$(str1+' i').addClass('fa-chevron-circle-left')
				$(str1+' i').removeClass('fa-chevron-circle-right')
				$(str2).hide()				
			})
		}else{
			$(str2).animate({right: '0px'}, 'slow', () => {
				$(str1+' i').addClass('fa-chevron-circle-right')
				$(str1+' i').removeClass('fa-chevron-circle-left')
			}).show()	
		}
	})
}

window.addEventListener('resize', function () { Manager.resize() })
window.addEventListener('contextmenu', function (e) { e.preventDefault() }, false)

document.addEventListener("keydown", function (e) { return control.keyDown(e.keyCode) });
document.addEventListener("keyup", function (e) { return control.keyUp(e.keyCode) });

init()
