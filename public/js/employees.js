var count = 0;
$(document).ready(function(){
	$.ajax({
		url:router('employee/info'),
		type:'get',
		dataType:'json',
		timeout:30000,
		success:function(res){
			delete res.info[0].insert_person;
			var interText = doT.template($("#company_info").text()); 
  			$(".bar-bottom ul").html(interText(res.list));
			$(".bar-bottom ul li").eq(0).addClass('high-light');
			var interText = doT.template($("#table_info").text()); 
			$(".table-wrap tbody").html(interText(dataReo(res.info)));
			ajax_res(res.info);
		}
	});
	$('.modal-dialog').css('margin-top','10%');
	$('.dropdown-menu li').click(function(){
		if(checkChange()==1) return;
		var text = $(this).find('a').html();
		$('.dropdown button').html(text+'<span class="caret"></span>');
		mySort(text);
	});
	$('#search').focus(function(e){
		if(document.activeElement.id=='search'&&$('#search').val()!=''){
			var left = $('#search').width();
			var top = $('#search').height()-13;
			$('.icon-form-del').css({
				'display':'block',
				'left':left,
				'top':top
			});
		}
		document.onkeyup = function(e){
			if(document.activeElement.id=='search'&&e.keyCode==13){
				if(checkChange()==1) return;
				$('.sear button').trigger('click');
			}
			if(document.activeElement.id=='search'&&$('#search').val()!=''){
				var left = $('#search').width();
				var top = $('#search').height()-13;
				$('.icon-form-del').css({
					'display':'block',
					'left':left,
					'top':top
				});
			}
		}
	});
	$('#search').blur(function(){
		setTimeout(function(){
			$('.icon-form-del').hide();
		},300);
	});
});
function ajax_res(res){
	transPerson();
	$('.right-score span').html(parseInt(res[0].info_score)+'%');
	var len = $('.table-wrap tbody input').length;
	for (var i = 0; i < len; i++) {
		var key = $('.table-wrap tbody input').eq(i).attr('data-value');
		var val = $('.table-wrap tbody input').eq(i).val();
		if(key=='user_id'){
			$('.table-wrap tbody').attr('data-id',val);
		}
	};
	selectList();
	album(res[0].album);
	$(".datepicker").kendoDatePicker();
	var val = $(".datepicker").val();
	$(".datepicker").keyup(function(){
		$(this).val(val);
	});
}
function filter(){
	if(checkChange()==1) return;
	$('#myModal').modal();
}
function checkCpy(obj){
	if(checkChange()==1) return;
	$('.bar-bottom li').removeClass('high-light');
	$(obj).addClass('high-light');
	var user_id = $(obj).attr('data-id');
	$.ajax({
		url:router('employee/info'),
		type:'get',
		dataType:'json',
		timeout:30000,
		data:{
			'user_id':user_id,
			
		},
		success:function(res){
			delete res[0].insert_person;
			var interText = doT.template($("#table_info").text()); 
  			$(".table-wrap tbody").html(interText(dataReo(res)));
  			ajax_res(res);
		}
	});
}
function sub(){
	var user_name = $('.modal-dialog .modal-body input[type="text"]').eq(0).val();
	var user_id = $('.modal-dialog .modal-body input[type="text"]').eq(1).val();
	if(user_name==''||user_id==''){
		$('#myModal').trigger('click');
		toast('????????????????????????');
		return;
	}
	if(/^\d{1,8}$/ig.test(user_id)==false){
		toast('????????????????????????');
		return;
	}
	if(checkAbb(user_id)==1) return;
	$.ajax({
		url:router('employee/createCpy'),
		type:'post',
		dataType:'json',
		timeout:30000,
		data:{
			'user_name':user_name,
			'user_id':user_id
		},
		success:function(res){
			$('#myModal').trigger('click');
			var interText = doT.template($("#company_info").text()); 
  			$(".bar-bottom ul").html(interText(res));
			$('.bar-bottom li').removeClass('high-light');
			$('.bar-bottom li:last').addClass('high-light');
			$('.bar-bottom li:last').trigger('click');
			var height = $('.bar-bottom ul').height();
			$('.bar-bottom').scrollTop(height);
		}
	});
}
function search(){
	if(checkChange()==1) return;
	var keyword = $('.sear input').val();
	toast('????????????...','info',1);
	$.ajax({
		url:router('employee/search'),
		type:'get',
		dataType:'json',
		timeout:30000,
		data:{
			'keyword':keyword
		},
		success:function(res){
			$('.alert').remove();
			if(res&&res.err){
				toast('?????????????????????');
				// $(".bar-bottom ul,.table-wrap tbody").html('');
				// newCpy();
				return false;
			}
			$('#check_job').prop('checked',true);
			var interText = doT.template($("#company_info").text()); 
  			$(".bar-bottom ul").html(interText(res.list));
			$(".bar-bottom ul li").eq(0).addClass('high-light');
			var interText = doT.template($("#table_info").text()); 
  			$(".table-wrap tbody").html(interText(dataReo(res.info)));
  			ajax_res(res.info);
		}
	});
}
function mySort(key){
	if(key=="?????????????????????"){
		key = "all";
	}else if(key=="??????"){
		key = "user_id";
	}else if(key=="??????"){
		key = "first_name";
	}else if(key=="????????????"){
		key = "birth";
	}else if(key=="????????????"){
		key = "update_time";
	}
	toast('????????????...','info',1);
	$.ajax({
		url:router('employee/mySort'),
		type:'get',
		dataType:'json',
		timeout:30000,
		data:{
			'key':key
		},
		success:function(res){
			$('.alert').remove();
			$('#check_job').prop('checked',true);
			var interText = doT.template($("#company_info").text()); 
  			$(".bar-bottom ul").html(interText(res));
			$(".bar-bottom ul li").eq(0).addClass('high-light');
			$(".bar-bottom ul li").eq(0).trigger('click');
		}
	});
}
function subInfo(){
	var text = $('.table-wrap tbody').attr('data-cpy');
	$('#myModalLabel').html('?????????');
	$('.modal-body').html('????????????<span style="font-size: 18px;color: #f60;">'+text+'</span>??????????????????');
	$('.modal-footer').find('button').eq(1).attr('onclick','submitInfo("'+text+'");');
	$('#myModal').modal();
}
function submitInfo(cpy){
	if(checkForm()==0) return false;
	$('#myModal').trigger('click');
	var _str = '';
	var len = $('.table-wrap tbody input').length;
	for(var i=0;i<len;i++){
		if($('.table-wrap tbody tr').find('input').eq(i).attr('data-value')=='user_id'){
			var new_id = $('.table-wrap tbody tr').find('input').eq(i).val();
		}
		_str += trans(i)+' = ';
		if($('.table-wrap tbody tr').find('input').eq(i).attr('data-value')=='update_person'){
			var _val = $('.table-wrap tbody tr').find('input').eq(i).attr('data-person');
		}else{
			var _val = $('.table-wrap tbody tr').find('input').eq(i).val();
		}
		if(!_val){
			var val = '\"\"';
		}else{
			var val = makeSQL(trans(i),_val);
		}
		_str += val+',';
	}
	var str = _str.slice(0,_str.length-1);
	var user_id = $('.table-wrap tbody').attr('data-id');
	if(checkAbb2(new_id)==1) return;
	toast('????????????...','info',1);
	$.ajax({
		url:router('employee/updateInfo'),
		type:'post',
		dataType:'json',
		timeout:30000,
		data:{
			'user_id':user_id,
			'new_id':new_id,
			'str':str,
		},
		success:function(res){
			$('.alert').remove();
			var interText = doT.template($("#table_info").text()); 
  			$(".table-wrap tbody").html(interText(dataReo(res)));
  			ajax_res(res);
  			// album(res[0].album);
  			// $('.right-score span').html(res[0].info_score+'%');
  			// var data_cpy = $('.table-wrap tbody tr').eq(0).find('input').eq(0).val();
  			// $('.table-wrap tbody').attr('data-cpy',data_cpy);
  			$('.bar-bottom .high-light p').html('<span>'+res[0].user_name+'</span>');
  			$('.bar-bottom .high-light').attr({
  				'data-id':res[0].user_id
  			});
  			cancel();
  			// selectList();
  	// 		$("#datepicker").kendoDatePicker();
  	// 		var val = $("#datepicker").val();
  	// 		$("#datepicker").keyup(function(){
			// 	$(this).val(val);
			// });
			toast('????????????');
		}
	});
}
function makeSQL(key,val){
	if(key=='user_id'||key=='info_score'||key=='leader'||key=='seat'||key=='phone'||key=='em_phone'){
		return val;
	}else{
		if(key=='in_job_time'||key=='birth'||key=='leave_job_time'){
			if(val.indexOf('/')==-1){
				var str = '\"'+val+'\"';
			}else{
				var yy = val.split('/')[2];
				var mm = val.split('/')[0];
				var dd = val.split('/')[1];
				var st = yy+'-'+mm+'-'+dd;
				var str = '\"'+st+'\"';
			}
			return str;
		}else if(key=='on_job'){
			if(val=='??????'){
				return 1;
			}else if(val=='??????'){
				return 0;
			}else{
				return val;
			}
		}else{
			var str = '\"'+val+'\"';
			return str;
		}
	}
}
function dataChange(obj){
	// $('.table-wrap tbody').attr('data-change',true);
	// $(obj).attr('data-change',true);
	// var data = $(obj).attr('data-value');
	// if(data=='insert_time'||data=='verified'||data=='sex'||data=='relation'){
		$('.table-wrap tbody').attr('data-change',true);
		$(obj).attr('data-change',true);
	// }else{
	// 	var val = $(obj).val();
	// 	$(obj).blur(function(){
	// 		var v = $(obj).val();
	// 		if(val!=v){
	// 			$('.table-wrap tbody').attr('data-change',true);
	// 			$(obj).attr('data-change',true);
	// 		}
	// 	});
	// }
}
function checkChange(){
	if($('.table-wrap tbody').attr('data-change')){
		submitInfo();
		return 1;
	}else{
		return 0;
	}
}
function cancel(){
	$('.table-wrap tbody').removeAttr('data-change');
	$('.modal-dialog .modal-footer button').eq(0).removeAttr('onclick');
	checkChange();
}
function dataReo(obj){
	var arr = [];
	for(var j in obj[0]){
		if(j=='on_job'&&obj[0][j]==1){
			on_job = 1;
			break;
		}else{
			on_job = 0;
		}
	}
	if(on_job){
		for(var i in obj[0]){
			if(i!='id'&&i!='pwd'&&i!='info_score'&&i!='isdel'&&i!='leave_reason'&&i!='leave_job_time'&&i!='English_name'&&i!='English_abb'&&i!='roleId'){
				var o = {};
				o.key = i;
				o.val = obj[0][i]?obj[0][i]:'';
				arr.push(o);
			}
		}
	}else{
		for(var i in obj[0]){
			if(i!='id'&&i!='pwd'&&i!='info_score'&&i!='isdel'&&i!='English_name'&&i!='English_abb'&&i!='roleId'){
				var o = {};
				o.key = i;
				o.val = obj[0][i]?obj[0][i]:'';
				arr.push(o);
			}
		}
	}
	count = 0;
	return arr;
}
function transName(i){
	var arr = ['','??????','??????','?????????','????????????','????????????','?????????','??????','??????','??????','????????????','?????????','????????????','?????????',
	'????????????','??????','??????','??????','?????????','??????????????????','??????','??????','??????','????????????','?????????','??????','????????????','?????????',
	'?????????','???????????????','???????????????','????????????','????????????','??????','???????????????'];
	count++;
	return arr[count];
}
function trans(i){
	var val = $('.table-wrap td input').eq(i).attr('data-value');
	return val;
	// var arr = ['id','company','user_id','abb','cn_abb','reg_person','legal_person','province','town','reg_company','reg_addr','reg_tel','bank_name',
	// 'bank_account','tax_id','type','level','manager','datefrom','website','email','pwd','products','use_per','rem','update_time','credit_line',
	// 'credit_period','last_sale','total_sale','bussiness_addr','zip_code','album','info_score'];
	// return arr[i];
}
function cl(){
	$('#search').val('').focus();
}
function newCpy(){
	var str = '<p>'+
				'<div class="input-group">'+
				  '<span class="input-group-addon" id="basic-addon1">??????</span>'+
				  '<input type="text" class="form-control" placeholder="??????" aria-describedby="basic-addon1">'+
				  '<span class="input-group-addon" id="basic-addon2">??????</span>'+
				  '<input type="text" class="form-control" placeholder="??????" aria-describedby="basic-addon2">'+
				'</div>'+
			  '</p>';
	$('#myModalLabel').html('????????????');
	$('.modal-body').html(str);
	$('.modal-footer button').eq(1).attr('onclick','sub()');
	$('#myModal').modal();
}
function delCpyBtn(){
	var user_id = $('.table-wrap tbody').attr('data-id');
	$('#myModalLabel').html('?????????');
	$('.modal-body').html('??????????????????<span style="font-size:16px;color:#f60">'+user_id+'</span>???');
	$('.modal-footer button').eq(1).attr('onclick','delcpy()');
	$('#myModal').modal();
}
function delcpy(){
	$('#myModal').trigger('click');
	var user_id = $('.table-wrap tbody').attr('data-id');
	toast('????????????...','',1);
	$.ajax({
		url:router('employee/delCpy'),
		type:'delete',
		dataType:'json',
		timeout:30000,
		data:{
			'user_id':user_id,
		},
		success:function(res){
			if(res&&res.status=='succeed'){
				toast('???????????????');
				setTimeout(function(){
					window.location.reload();
				},1000);
			}
		}
	});
}
function album(opt){
	if(opt==''){
		arr = [''];
	}else{
		try{
			var arr = opt.split(',');
		}catch(e){
			var arr = [opt];
		}
	}
	var interText = doT.template($("#company_album").text()); 
	$("#myCarousel").html(interText(arr));
	$('.carousel').carousel();
}
function selectList(){
	$('.table-wrap input').click(function(){
		var v = $(this).val();
		// var key = $(this).parent().prev().html();
		var key = $(this).attr('data-value');
		if(list(key)==''){
			return false;
		}else{
			var arr = list(key);
			var _str = '';
			arr.forEach(function(item){
				_str +='<li>'+item+'</li>';
			});
			var width = $(this).width();
			var str = '<ul class="selectList" style="width:'+width+'px">'+_str+'</ul>';
			var that = this;
			$(this).parent().css('position','relative');
			$(this).parent().append(str);
			$(this).keyup(function(){
				$(this).val(v);
			});
			$('.selectList li').mouseover(function(){
				$(this).css('background','#999');
				$(this).parent().attr('data-rem',true);
			});
			$('.selectList li').mouseout(function(){
				$(this).css('background','#fff');
				$(this).parent().removeAttr('data-rem');
			});
			$('.selectList li').click(function(){
				dataChange();
				var val = $(this).html();
				$(that).val(val);
				$('.selectList').remove();
			});
			$(that).blur(function(){
				if(!$('.selectList').attr('data-rem')){
					$('.selectList').remove();
				}
			});
		}
	});
}
function list(key){
	switch(key){
		case 'on_job':
			return ['??????','??????'];
			break;
		case 'sex':
			return ['???','???','??????'];
			break;
		case 'branch':
			return ['?????????','?????????','?????????','???????????????','??????'];
			break;
		case 'edu':
			return ['??????','??????','??????','??????','??????','??????'];
			break;
		case 'marriage':
			return ['??????','??????'];
			break;
		case 'employ_way':
			return ['??????','??????','??????'];
			break;
		default:
			return '';
			break;
	}
}
function checkForm(){
	var len = $('.table-wrap td input').length;
	for(var i=0;i<len;i++){
		if($('.table-wrap td input').eq(i).attr('data-change')=='true'){
			if(checkPat(i)==0){
				return 0;
			}
		}
	}
}
function checkPat(i){
	var val = $('.table-wrap td input').eq(i).val();
	var pattern = $('.table-wrap td input').eq(i).attr('pattern');
	var pat = new RegExp(pattern,'ig');
	if(!pat.test(val)){
		deal(i);
		return 0;
	}
}
function deal(i){
	toast('????????????????????????');
	$('.table-wrap td input').eq(i).focus();
}

function checkAbb(id){
	var len = $('.bar-bottom li').length;
	var k = $('.bar-bottom li');
	for (var i = 0; i < len; i++) {
		if(k.eq(i).attr('data-id')==id){
			toast('?????????????????????');
			return 1;
		}
	};
}
function checkAbb2(id){
	var len = $('.bar-bottom li').length;
	var k = $('.bar-bottom li');
	for (var i = 0; i < len; i++) {
		if(k.eq(i).attr('data-id')==id&&(!k.eq(i).hasClass('high-light'))){         
			toast('???????????????????????????');
			return 1;
		}
	};
}
function checkJob(obj){
	var len = $('.bar-bottom li').length;
	if($('#check_job').is(':checked')){
		for (var i = 0; i < len; i++) {
			if($('.bar-bottom li').eq(i).attr('data-job')==0) {
				$('.bar-bottom li').eq(i).show();
			}
		};
	}else{
		for (var i = 0; i < len; i++) {
			if($('.bar-bottom li').eq(i).attr('data-job')==0){
				$('.bar-bottom li').eq(i).hide();
			}
		};
		$('.high-light').removeClass('high-light');
		for (var i = 0; i < len; i++) {
			if($('.bar-bottom li').eq(i).css('display')!='none'){
				$('.bar-bottom li').eq(i).addClass('high-light');
				$('.bar-bottom li').eq(i).trigger('click');
				break;
			}
		};
	}
}
function transPerson(){
	setTimeout(function(){
		var len = $('.table-wrap input').length;
		var t = $('.table-wrap input');
		for (var i = 0; i < len; i++) {
			if(t.eq(i).attr('data-value')=='update_person'){
				var val = t.eq(i).val();
				var ind = i;
				$.ajax({
					url:router('customer/transPerson'),
					type:'get',
					dataType:'json',
					timeout:30000,
					data:{
						'val':val,
					},
					success:function(res){
						t.eq(ind).val(res[0].user_name);
						t.eq(ind).attr('data-person',val);
					}
				});
			}
		};
	},50);
}
function table(key){
	switch(key){
		case 'user_name' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'open_id' :
			return {
				'name':'open_id',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'user_id' :
			return {
				'name':'??????',
				'readonly':'readonly',
				'pattern':'^\\d{3,4}$'
			};
			break;
		case 'leader' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'^\\d{1,11}$'
			};
			break;
		case 'seat' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'^\\d{1,11}$'
			};
			break;
		case 'on_job' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'in_job_time' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
				'type':'datepicker'
			};
			break;
		case 'sex' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'branch' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'position' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'nation' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'birth' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
				'type':'datepicker'
			};
			break;
		case 'identify' :
			return {
				'name':'?????????',
				'readonly':'',
				'pattern':'^\\d{15}|\\d{17}[0-9Xx]$'
			};
			break;
		case 'native' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'native_adr' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'edu' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'school' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'pro' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'marriage' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':''
			};
			break;
		case 'wife_child' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'employ_way' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'qq' :
			return {
				'name':'qq',
				'readonly':'',
				'pattern':'^\\d{6,12}$',
			};
			break;
		case 'phone' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'^1(3|5|7|8|9)\\d{9}$'
			};
			break;
		case 'em_contacter' :
			return {
				'name':'???????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'em_phone' :
			return {
				'name':'?????????????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'addr' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'leave_job_time' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
				'type':'datepicker'
			};
			break;
		case 'leave_reason' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'work_addr' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'rem' :
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'insert_time' :
			return {
				'name':'????????????',
				'readonly':'readonly',
				'pattern':''
			};
			break;
		case 'album' :
			return {
				'name':'??????',
				'readonly':'readonly',
				'pattern':'',
			};
			break;
		case 'update_person' :
			return {
				'name':'?????????',
				'readonly':'readonly',
				'pattern':'',
			};
			break;
		case 'info_score' :
			return {
				'name':'???????????????',
				'readonly':'readonly',
				'pattern':'',
			};
			break;
		case 'update_time' :
			return {
				'name':'????????????',
				'readonly':'readonly',
				'pattern':'',
			};
			break;
		case 'work_phone' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		case 'group' :
			return {
				'name':'????????????',
				'readonly':'',
				'pattern':'',
			};
			break;
		default: 
			return {
				'name':'??????',
				'readonly':'',
				'pattern':'',
			};
			break;
	}
}