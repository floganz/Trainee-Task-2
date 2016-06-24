$(document).ready(function(){
	var userData={};
	userData.isLogin=false;
 	function authInfo(response) {
 		if (response.session) {
 			VK.Api.call('users.get', {user_ids: response.session.mid}, function (r){
 				if(r.response) {
 					userData.userID=response.session.mid;
 					userData.firstName=r.response[0].first_name;
 					userData.lastName=r.response[0].last_name;
 					userData.service="vk";
					$('#notAuth').addClass("hidden");
					$("#Auth").removeClass("hidden");
					$("#Auth").find("#userName")
					.text(r.response[0].first_name + " " + r.response[0].last_name+"!");
					userData.isLogin=true;
					controls();
		 		} else {
				    $('#notAuth').removeClass("hidden");
				    $('#Auth').addClass("hidden");
				    userData={};
					userData.isLogin=false;
					controls();
 				}
 			});
		  } else {
			$('#notAuth').removeClass("hidden");
			$('#Auth').addClass("hidden");
			userData={};
			userData.isLogin=false;
			controls();
		  }
	}

 	function authInfoFb(response) {
 		if (response.status === 'connected') {
 			FB.api('/me', function(response) {
				userData.userID=response.id;
				var tmp=response.name.split(" ");
				userData.firstName=tmp[0];
				userData.lastName=tmp[1];
				userData.service="fb";
				$('#notAuth').addClass("hidden");
				$("#Auth").removeClass("hidden");
				$("#Auth").find("#userName")
				.text(userData.firstName + " " + userData.lastName +"!");
				userData.isLogin=true;
				controls();
			});
		} else {
			if (userData.service != "vk") {
				$('#notAuth').removeClass("hidden");
				$('#Auth').addClass("hidden");
				userData={};
				userData.isLogin=false;
				controls();
			}
		}
	}

	VK.Auth.getLoginStatus(authInfo);
	FB.getLoginStatus(authInfoFb);

	$("#notAuth").on('click', '#login_vk', function(){
		VK.Auth.login(authInfo);
	});

	$("#notAuth").on('click', '#login_fb', function(){
		FB.login(authInfoFb);
	});

	$("#Auth").on('click', '#logout_button', function(event){
		event.preventDefault();
		if(userData.service=="vk")
			VK.Auth.logout(authInfo);
		else
			FB.logout(authInfoFb);
	});

	$('#newMes').on('click', '#sendMes', function (event) {
		event.preventDefault();
		userData.date=new Date();
		userData.date.setHours(userData.date.getHours() - userData.date.getTimezoneOffset() / 60);
		if($('#mes').val() != "") {
			userData.mes=$('#mes').val();
			$('#mes').closest("div").removeClass("has-error")
			$('.help-block').remove();
			$('#mes').val("");
		} else {
			$('#mes').closest("div").addClass("has-error")
			.append('<span class="help-block">Чтобы добавить сообщение - введите его ;)</span>');
			return
		}
		
		var formData=JSON.stringify(userData);
		$.post('/addNewMes.php',formData,function(response){
			var data=JSON.parse(response);
			$("#end").remove();
			place("feed",data);
		})
	});

	var openedAnswer=-1;

	$("#feed").on('click', '.reply', function()
	{
		$("#edt").remove();
		$("#ans").remove();
		var commentID=$(this).closest("li").find(".mes").attr("id") || -2;
		if(openedAnswer==commentID) {
			$(this).find("#ans").remove();
			openedAnswer=-1;
			openedEdit=-1;
			return
		}
		openedAnswer=-1;
		openedEdit=-1;
		if(commentID!=-2) {
			var answer=$('<form id="ans" class="form-inline"></form>')
			.append('<div class="form-group"><textarea id="ansText" cols=30 rows=5 class="form-control"></textarea></div')
			.append('<button id="sendAns" class="btn btn-default">Отправить</button>');
			openedAnswer=commentID;
			answer.insertAfter($(this).parent());
		}
	});

	$("#feed").on('click', '#sendAns', function(){
		event.preventDefault();
		var commentID=$(this).closest("li").find("div.mes").attr("id") || -1;
		userData.date=new Date();
		if($('#ansText').val() != "") {
			userData.mes=$('#ansText').val();
			$('#mes').closest("div").removeClass("has-error")
			$('.help-block').remove();
		} else {
			$("#ans").find("div").addClass("has-error")
			.append('<span class="help-block">Чтобы добавить комментарий - введите его ;)</span>');
			return
		}
		userData.parentID=commentID;
		var formData=JSON.stringify(userData);
		var state=$(this).closest("li").find("div.Expand");
		$.post('/addNewAns.php',formData,function(response){
			openedAnswer=-1;
			$("#ans").remove();
			if (state.hasClass("Closed")) {
				loadBranch.call(state);
				return
			}
			if (state.hasClass("Opened")) {
				state.removeClass("Opened").addClass("Closed");
				state.siblings("ul").children().empty();
				loadBranch.call(state);
				return
			}
			state.removeClass("Leaf").addClass("Closed");
			loadBranch.call(state);
			return
		})
	});

	var openedEdit=-1;

	$("#feed").on('click', '.edit', function()
	{
		$("#ans").remove();
		$("#edt").remove();
		var commentID=$(this).closest("li").find("div.mes").attr("id") || -2;
		if(openedEdit==commentID) {
			$(this).find("#edt").remove();
			openedEdit=-1;
			openedAnswer=-1;
			return
		}
		openedEdit=-1;
		openedAnswer=-1;
		var userID=$(this).closest("li").find("div.mes").attr("userID") || -1;
		if(userID==userData.userID && commentID!=-2){
			var edit=$('<form id="edt" class="form-inline"></form>')
			.append('<div class="form-group"><textarea id="edtText" cols=30 rows=5 class="form-control"></textarea></div')
			.append('<button id="sendEdt" class="btn btn-default">Изменить</button>');
			openedEdit=commentID;
			edit.insertAfter($(this).parent());
			$("#edtText").text($("div #"+commentID).find("div.mesText").text());
		}
	});

	$("#feed").on('click', '#sendEdt', function(){
		var commentID=$(this).closest("li").find("div.mes").attr("id") || -1;
		event.preventDefault();
		userData.date=new Date();
		if($('#edtText').val() != "") {
			userData.mes=$('#edtText').val();
		} else {
			$("#edt").remove();
			return
		}
		userData.commentID=commentID;
		var formData=JSON.stringify(userData);
		$.post('/addNewEdt.php',formData,function(response){
			var data=JSON.parse(response);
			if(data)
			{
				$("div #"+commentID).find("div.mesText").text(userData.mes);
			}
			$("#edt").remove();
		})
	});

	function place(base,data){
		for(var i=0;i<data.length;i++)
		{
			var node=$('<li class="node"><div class="mes" id="'+data[i][0]+'" userID="'
				+data[i][1]+'"><span class="userName">'+data[i][4]+' '+data[i][5]
				+'</span><div class="mesText">'+data[i][3]
				+'</div></div><div class="footer"><span class="mesTime">'
				+$.format.date(data[i][2], 'd MMM в HH:mm')+'</span></div></li>');
			$("#"+base).prepend(node)
			$("div #"+data[i][0]).closest("li").append('<ul id="subTree'+data[i][0]+'"></ul>')
			if(userData.isLogin) {
				var extra = data[i][1]==userData.userID ? $('<button class="edit btn-link">Редактировать</button>') : $('<button class="reply btn-link">Ответить</button>');
				$("div #"+data[i][0]).closest("li").find(".footer").append(extra)
			}
			if(data[i][6]) {
				$("div #"+data[i][0]).closest("li").prepend('<div class="Expand Closed"></div');
			} else {
				$("div #"+data[i][0]).closest("li").prepend('<div class="Expand Leaf"></div');
			}
		}	
	}

	function initTree(){
		$.get("/mesLoad.php?offset=0", function(response){
			var data=JSON.parse(response);
			if ( data.length !=0 ) {
				placeFeed("tree",data);
			} else {
				$("#feed").append('<h3 id="end">Ещё нет ни одного сообщения, вы можете стать первым!</h3>');
			}

		});
	}

	initTree();

	function switchClass(elem) {
		if($(elem).hasClass("Opened")) {
			$(elem).removeClass("Opened").addClass("Closed");
		} else {
			$(elem).removeClass("Closed").addClass("Opened");
		}
	}

	function loadBranch() {
		if ( !$(this).hasClass("Closed") && !$(this).hasClass("Opened")) {
			return
		}
		if ($(this).hasClass("Closed")) {
			switchClass($(this));
			var nodeID=$(this).next().attr("id") || -1;
			if(nodeID!=-1) {
				$.get("/loadData.php?anc="+nodeID, function(response){
					var data=JSON.parse(response);
					console.log(data);
					place("subTree"+nodeID,data);
				});	
			}
		} else {
			$(this).siblings("ul").children().remove();
			switchClass($(this));
		}
	}

	$("#feed").on('click', '.Expand', loadBranch);

	function controls() {
		if(userData.isLogin) {
			$(".mes").each( function (i) {
				if( !($(this).find("button") > 0) ) {
					var userId=$(this).attr("userID") || -1;
					if ( userId == -1)
						return
					if ( userId==userData.userID ) {
						$(this).closest("li").find(" > .footer").append('<button class="edit btn-link">Редактировать</button>');
					} else {
						$(this).closest("li").find(" > .footer").append('<button class="reply btn-link">Ответить</button>');
					}
				}
			});
		} else {
			$(".node").each( function (i) {
					$(this).find("button").remove();
			});
		}
	}

	function placeFeed(base,data){
		for(var i=0;i<data.length;i++)
		{
			var node=$('<li class="node"><div class="mes" id="'+data[i][0]+'" userID="'
				+data[i][1]+'"><span class="userName">'+data[i][4]+' '+data[i][5]
				+'</span><div class="mesText">'+data[i][3]
				+'</div></div><div class="footer"><span class="mesTime">'
				+$.format.date(data[i][2], 'd MMM в HH:mm')+'</span></div></li>');
			$("#"+base).append(node)
			$("div #"+data[i][0]).closest("li").append('<ul id="subTree'+data[i][0]+'"></ul>')
			if(userData.isLogin) {
				var extra = data[i][1]==userData.userID ? $('<button class="edit btn-link">Редактировать</button>') : $('<button class="reply btn-link">Ответить</button>');
				$("div #"+data[i][0]).closest("li").find(".footer").append(extra)
			}
			if(data[i][6]) {
				$("div #"+data[i][0]).closest("li").prepend('<div class="Expand Closed"></div');
			} else {
				$("div #"+data[i][0]).closest("li").prepend('<div class="Expand Leaf"></div');
			}
		}	
	}

	var infScr={};
	infScr.scroll=true;
	infScr.delay=500;
	infScr.busy=false;
	infScr.count=10;
	infScr.offset=0;
	infScr.end=false;
	infScr.getData=function(){
		$.get("/mesLoad.php?offset="+this.offset, function(response){
			var data=JSON.parse(response);
			if ( data.length ==  0 && !infScr.end) {
				$("#feed").append('<h3 id="end">Вы достигли конца ленты!</h3>');
				infScr.end=true;
			}
			placeFeed("tree",data);
			infScr.busy=false;
		});
	};

	if(infScr.scroll == true) {
	   $(window).scroll(function() {
	      if($(window).scrollTop() + $(window).height() > $("#feed").height() && !infScr.busy) {
	         infScr.busy = true;
	         infScr.offset+=infScr.count;
	         setTimeout(function() {
	            infScr.getData();      
	         }, infScr.delay);         
	      }  
	   });
	}
});