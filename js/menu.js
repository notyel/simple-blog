$(document).ready(main);
var contador = 1;
var ancho = $(document).width();
function main (){
	$('.menu-bar').click(function(){
		// $('nav').toggle(); Forma Sencilla de aparecer y desaparecer
		
		if (contador == 1){
			$('nav').animate({
				left: '0'
			});
			contador = 0;
		} else {
			contador = 1;
			$('nav').animate({
				left: '-100%'
			});
		};
		
	});

	// Mostramos y ocultamos submenus
	$('.submenu').click(function(){
		$(this).children('.children').slideToggle();
	});
};