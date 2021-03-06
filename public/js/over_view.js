var group = "";
var level = '';
var credit_qualified = '';
var injection = {};
var token = encodeURIComponent(GetRequestSelf('token'));
$(document).ready(function () {
    dataSource = new kendo.data.DataSource({
        transport: {
            read:  {
                url: route('admin/getOver'),
                type: 'post',
                dataType: "json"
            },
            parameterMap: function(options, operation) {
                if (operation == "read") {
                    var parameter = {
                        page: options.page,
                        pageSize: options.pageSize,
                        keywords: $('#search').val(),
                        filter: {
                            group: group,
                            level: level,
                            credit_qualified: credit_qualified
                        }
                    };
                    if(options.sort&&options.sort.length!=0){
                        parameter.field = options.sort[0].field;
                        parameter.dir = options.sort[0].dir;
                    }
                    return {models: kendo.stringify(parameter)};
                }else{
                    return {models: kendo.stringify(options.models)};
                }
            }
        },
        batch: true,
        pageSize: 100,
        serverPaging: true,
        serverSorting: false,
        schema: {
            model: {
                id: "id",
                fields: {
                    id: { editable: false, nullable: true },
                    company: { editable: false},
                    credit_line: { editable: false},
                    credit_period: { editable: false},
                    over_price: { editable: false},
                    over: { editable: false},
                    over_time: { editable: false},
                    inside_count: { editable: false},
                    outside_count: { editable: false},
                    freeze_count: { editable: false}
                }
            },
            data: function (response) {
                return response.data;
            },
            total: function (response) {
                return response.total;
            }
        },
        requestEnd: function (e) {  
            //????????????????????????????????????????????????kendo??????
            var data = e.response.data;
            data.forEach(function(items,index){
                data[index].over = parseInt(items.credit_line - items.over_price + items.freeze_amount);
            });
        }
    });
    init();
});
$(document).on('click','#grid tbody tr td',function(e){
    var tr = $(e.target).closest('tr');
    var data_tr = $("#grid").data('kendoGrid').dataItem(tr);
    var company = data_tr.company;
    var td = $(e.target).closest('td');
    var index = $(td).index();
    if(index==4){
        searchHistoryData(company,function(res){
            var credit_line = 10000;
            var credit_period = 6;
            if(res.data[0]!=null){
                credit_line = res.data[0].credit_line;
                credit_period = res.data[0].credit_period;
            }
            var str = '<p style="text-align: center">???????????????<input name="credit_line" value="'+credit_line+'"></p>'+
                  '<p style="text-align: center">???????????????<input name="credit_period" value="'+credit_period+'"></p>'+
                  '<p style="text-align: center">???????????????<input name="credit_time"></p>'+
                  '<p style="text-align: center">???????????????<input name="reason" class="k-textbox"></p>';
            initDialog({
                title: '?????????<span class="cpy">'+company+'</span>???',
                content: str,
                actions: [
                    { text: '??????', primary: true , action: function(){
                        createCredit();
                    } },
                    { text: '??????', action: function(){
                        del();
                    } }
                ]
            });
            $('input[name=credit_line]').kendoNumericTextBox({
                format: '#',
                min: 0,
                max: 5000000,
                step: 1000
            });
            $('input[name=credit_period]').kendoNumericTextBox({
                format: '#',
                min: 1,
                max: 50,
                step: 1
            });
            $('input[name=credit_time]').val(dateTime());
            $('input[name=credit_time]').kendoDatePicker({
                format: "yyyy-MM-dd",
                parseFormats: ["yyyy-MM-dd"]
            });
        });
    }else if(index==9){
        initDialog({
            title: '<span>?????????????????????<span class="amount_not_freeze">0</span></span><span style="margin-left: 180px">??????????????????<span class="amount_freeze">0</span></span>',
            width: '600px',
            content: '<p class="need_contract_no"><ul class="contracts_list"></ul></p>',
            actions: [
                { text: '??????', primary: true , action: function(){
                    setFreezeContracts();
                } },
                { text: '??????', action: function(e){
                    goToContractView(e);
                } },
                { text: '??????', action: function(){
                    del();
                } }
            ]
        });
        $.ajax({
            url: route('admin/getNeedFreezeContracts'),
            type: 'get',
            dataType:"json",
            data: {
                company: company
            },
            success: function(res) {
                var freezeStr = '';
                var amount_freeze = 0,amount_not_freeze = 0;
                for (var i = 0; i < res.data.freezeArr.length; i++) {
                    var _check = res.data.freezeArr[i].data.isFreeze?'checked':'';
                    var overdraft = res.data.freezeArr[i].data.payable - res.data.freezeArr[i].data.paid;
                    freezeStr += '<li title="?????????'+overdraft+'"><label><input type="checkbox" '+_check+' /><span style="margin-left:5px">'+res.data.freezeArr[i].data.contract_no+'</span></label></li>';
                    amount_freeze += overdraft;
                }
                for (var i = 0; i < res.data.notFreezeArr.length; i++) {
                    var _check = res.data.notFreezeArr[i].data.isFreeze?'checked':'';
                    var overdraft = res.data.notFreezeArr[i].data.payable - res.data.notFreezeArr[i].data.paid;
                    freezeStr += '<li title="?????????'+overdraft+'"><label><input type="checkbox" '+_check+' /><span style="margin-left:5px">'+res.data.notFreezeArr[i].data.contract_no+'</span></label></li>';
                    amount_not_freeze += overdraft;
                }
                $('.contracts_list').append(freezeStr);
                $('.amount_freeze').text(amount_freeze);
                $('.amount_not_freeze').text(amount_not_freeze);
                var height = window.innerHeight;
                var dialog_height = $('.k-dialog').height();
                $('.k-dialog').css({
                    top: (height - dialog_height)/2+'px'
                });
            }
        });
    }else if(index==7){
        getDataList('inside_count','???????????????????????????');
    }else if(index==8){
        getDataList('outside_count','????????????');
    }

    function getDataList(type,title){
        $.ajax({
            url: route('admin/getReportList'),
            type: 'get',
            dataType:"json",
            data: {
                company: company,
                type: type
            },
            success: function(res) {
                var str = '';
                var allOverDraft = 0;
                for (var i = 0; i < res.data.length; i++) {
                    var overdraft = res.data[i].data.payable - res.data[i].data.paid;
                    allOverDraft += overdraft;
                    str += '<p title="?????????'+overdraft+'" style="float: left;margin-left: 20px;">'+res.data[i].data.contract_no+'</p>';
                }
                initDialog({
                    title: title+'???????????????'+allOverDraft+'???',
                    content: str,
                    actions: [
                        { text: '??????', primary: true , action: function(e){
                            goToContractView(e,1);
                        } },
                        { text: '??????', action: function(){
                            del();
                        } }
                    ]
                });
            }
        });
    }
});
$(document).on('change','.contracts_list>li input[type=checkbox]',function(e){
    var sum = parseInt($(this).parent().parent().attr('title').split('?????????')[1]);
    var amount_freeze = parseInt($('.amount_freeze').text());
    var amount_not_freeze = parseInt($('.amount_not_freeze').text());
    if($(this).prop('checked')){
        $('.amount_freeze').text(amount_freeze+sum);
        $('.amount_not_freeze').text(amount_not_freeze-sum);
    }else{
        $('.amount_freeze').text(amount_freeze-sum);
        $('.amount_not_freeze').text(amount_not_freeze+sum);
    }
});
$(document).on('change','.filter_box',function(){
    var filter = $(this).attr('data-filter');
    var checkedArr = [];
    $('.filter_box:checked').each(function(){
        if($(this).attr('data-filter')==filter){
            checkedArr.push($(this).val());
        }
    });
    if(filter=='group'){
        group = checkedArr.join();
    }else if(filter=='level'){
        level = checkedArr.join();
    }else if(filter=='credit_qualified'){
        credit_qualified = checkedArr.join();
    }
    search();
});

function init(){
    var height = $('body').height()-3;
    $("#grid").kendoGrid({
        dataSource: dataSource,
        pageable: true,
        height: height,
        toolbar: [{template: kendo.template($("#select").html())},{template: kendo.template($("#template").html())}],
        pageable: {
            refresh: true,
            buttonCount: 5,
            page: 1,
            pageSize: 100,
            pageSizes: [10,30,50,100,200,500],
            messages: {
                display: "?????? {0} - {1}?????? {2} ???",
                empty: "????????????",
                page: "???",
                of: "/ {0}",
                itemsPerPage: "???/???",
                first: "?????????",
                previous: "?????????",
                next: "?????????",
                last: "????????????",
                refresh: "??????"
            }
        },
        sortable: true,
        detailInit: detailInit,
        columns: [
            { field: "company", title: "????????????",width: '250px', template: function(dataItem){
                if (dataItem.isMark == 0) {
                    return '<span onclick="mark(this)" data-company="'+dataItem.company+'" data-mark="'+dataItem.isMark+'" class="iconfont icon-star" style="color: #eee;cursor: pointer;"></span><span>'+dataItem.company + '</span>';
                } else {
                    return '<span onclick="mark(this)" data-company="'+dataItem.company+'" data-mark="'+dataItem.isMark+'" class="iconfont icon-star" style="color: rgb(255, 193, 7);cursor: pointer;"></span><span>'+dataItem.company + '</span>';
                }
            }},
            { field: "credit_line", title: "????????????",width: '100px'},
            { field: "credit_period", title: "?????????",width: '100px'},
            { field: "over_price", title: "????????????",width: '100px',template: function(dataItem){
                if(dataItem.over_price<0){
                    return '<span style="color: #f00;">'+dataItem.over_price + '</span>';
                }else{
                    return '<span>'+dataItem.over_price + '</span>';
                }
            }},
            { field: "over", title: "?????????",width: '100px'},
            { field: "over_time", title: "????????????",width: '100px',template: function(dataItem){
                if(dataItem.over_time<0){
                    return '<span style="color: #f00;">'+dataItem.over_time + '???</span>';
                }else{
                    return '<span>'+dataItem.over_time + '???</span>';
                }
            }},
            { field: "inside_count", title: "????????????",width: '100px'},
            { field: "outside_count", title: "????????????",width: '100px'},
            { field: "freeze_count", title: "????????????",width: '100px'},
            { command: [{name:"????????????",click: trend},{name:"????????????",click: getCredit},{name:"??????",click: NotiSaleman}], title: "&nbsp;", width: 240 }
        ],
        editable: true
    });
    var data = [
        { text: "??????", value: "" },
        { text: "?????????", value: "?????????" },
        { text: "?????????", value: "?????????" }
    ];
    $("#customer").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
        change: onChange
    });
    function onChange() {
        group = $("#customer").val();
        search();
    }
}

function mark(obj) {
    var company = $(obj).attr('data-company');
    var isMark = $(obj).attr('data-mark');
    $.ajax({
        url: route('admin/updateMarkItem?token='+token),
        type: 'put',
        data: {
            company: company,
            isMark: isMark == 1 ? 0 : 1,
        },
        dataType:"json",
        success: function(res) {
            $('#grid').data("kendoGrid").dataSource.read();
        }
    });
}

/* ?????????????????????????????????????????? */
function searchHistoryData(compnay,cb){
    $.ajax({
        url: route('admin/credit/list'),
        type: 'POST',
        data: {
            models: JSON.stringify({
                page: 1,
                pageSize: 30,
                keywords: compnay
            })
        },
        dataType:"json",
        success: function(res) {
            cb(res);
        }
    });
}

function trend(e){
    // window.top.$('header p').text('????????????');
    var tr = e.target.closest("tr");
    injection = $("#grid").data("kendoGrid").dataItem(tr);
    if(injection.credit_line==0){
        TOAST('??????????????????');
        return;
    }
    var height = $('#grid').height();
    $('#grid').hide();
    $('body').append('<iframe id="in_frame" name="in_frame" style="height: '+height+'px;width:100%;position:absolute;z-index:99999;border:none;" src="../html/credit_trend.html" >');
    // window.top.$('header').prepend('<span style="position: absolute;left: 20px;top: 13px;font-size: 17px;cursor: pointer;" onclick="removeIframe();">??????</span>');
}

function getCredit(e){
    var tr = e.target.closest("tr");
    var height = $('#grid').height();
    var c_data = $("#grid").data("kendoGrid").dataItem(tr);
    var company = c_data.company;
    $('#grid').hide();
    sessionStorage.setItem('creditCpy',company);
    $('body').append('<iframe id="in_frame" name="in_frame" style="height: '+height+'px;width:100%;position:absolute;z-index:99999;border:none;" src="../html/credit_records.html?token='+token+'" >');
}

function search(){
    $('.k-pager-first').trigger('click');
    // $('#grid').data("kendoGrid").dataSource.options.page = 1;
    $('#grid').data("kendoGrid").dataSource.read();
}

function initDialog(option){
    var str = '<div id="dialog" style="font-size: 14px;"></div>';
    $('body').append(str);
    $('#dialog').kendoDialog({
        width: option.width?option.width:"500px",
        "max-height": "600px",
        title: option.title,
        closable: false,
        modal: true,
        content: option.content,
        actions: option.actions
    });
}
function del(){
    $('.k-dialog,.k-overlay').remove();
}
function createCredit(){
    var form_data = {};
    form_data.company = $('.cpy').text();
    form_data.credit_line = $('input[name=credit_line]').val();
    form_data.credit_period = $('input[name=credit_period]').val();
    form_data.credit_time = $('input[name=credit_time]').val();
    form_data.reason = $('input[name=reason]').val()?$('input[name=reason]').val():null;
    del();
    $.ajax({
        url: route('admin/credit/add?token='+token),
        type: 'post',
        data: {
            models: JSON.stringify([form_data])
        },
        dataType:"json",
        success: function(res) {
            $('#grid').data("kendoGrid").dataSource.read();
            TOAST(res.msg);
        }
    });
}
function setFreezeContracts(){
    var freezeArr = [],notFreezeArr = [];
    $('.contracts_list li').each(function(){
        if($(this).find('input[type=checkbox]').prop('checked')==true){
            freezeArr.push($(this).find('span').text());
        }else{
            notFreezeArr.push($(this).find('span').text());
        }
    });
    $.ajax({
        url: route('admin/contract/batchFreeze?token='+token),
        type: 'put',
        data: {
            freezeArr: JSON.stringify(freezeArr),
            notFreezeArr: JSON.stringify(notFreezeArr)
        },
        dataType:"json",
        success: function(res) {
            $('#grid').data("kendoGrid").dataSource.read();
            TOAST(res.msg);
        }
    });
}
function TOAST(str,type,n){
    if(type=='info'||!type){
        var icon = 'icon-correct';
        var color = '#3e4a61';
    }else if(type=='err'){
        var icon = 'icon-cha';
        var color = '#3e4a61';
    }
    var html = '<div id="my-toast" class="k-overlay" style="display: block; z-index: 99; opacity: 0.4;"></div>'+
                '<div id="hs_modal" style="width: 100%;height: 100%;position: fixed;top:0;z-index: 100;">'+
                    '<div style="display:flex;color:white;width:auto;height: auto;min-width: 250px;max-width: 500px;min-height: 125px;border-radius:7px;padding: 18px 30px;position: absolute;top:50%;left: 50%;box-shadow: 0 2px 2px 0 rgba(0,0,0,.3);transform: translate(-50%,-50%);background: '+color+';">'+
                        '<div class="iconfont '+icon+'" style="display:flex;align-items: center;font-size:45px;margin-right: 20px;"></div>'+
                        '<div style="letter-spacing: 1px;display:flex;align-items:center;font-size:20px;word-wrap: break-word;">'+str+'</div>'+
                    '</div>'+
                '</div>';
    $("body").append(html);
    // window.top.$("body").append(html);
    if(!n){
        setTimeout(function(){
            CANCEL();
        },1500);
    }
}
function CANCEL(){
    // window.top.$('#my-toast,#hs_modal').remove();
    $('#my-toast,#hs_modal').remove();
}

function goToContractView(e,mark){
    var contracts_arr = [];
    if(mark){
        $('#dialog p').each(function(){
            contracts_arr.push($(this).text());
        });
    }else{
        $('.contracts_list li span').each(function(){
            contracts_arr.push($(this).text());
        });
    }
    setTimeout(function(){
        $('.k-dialog').show();
        $('body').append('<div class="k-overlay" aria-hidden="true" style="z-index: 10002; opacity: 0.5;"></div>');
    },2000);
    sessionStorage.setItem('contract',JSON.stringify(contracts_arr));
    var height = $('#grid').height();
    $('#grid').hide();
    $('body').append('<iframe id="in_frame" name="in_frame" style="height: '+height+'px;width:100%;position:absolute;z-index:99999;border:none;" src="../html/contracts_view.html" >');
}

function detailInit(e) {
    var abb = e.data.abb;
    fetchRemList(abb);
    var str = '<div style="display: flex;">'+
        '<div>?????????</div>'+
        '<div class="cls_'+abb+'">'+
            '<p style="cursor: pointer;" data-abb="'+abb+'" onclick="appendInput(this);">'+
                '<span class="iconfont icon-sign"></span>'+
                '<span>??????</span>'+
            '</p>'+
        '</div>'+
    '</div>';
    $(str).appendTo(e.detailCell);
}

function appendInput(obj) {
    if ($(obj).parent().find('.addRem').length !== 0) return;
    var abb = $(obj).attr('data-abb');
    $(obj).after('<div class="addRem">' +
        '<input class="addRemInput k-textbox" style="width: 200px;" />' +
        '<button class="k-button k-primary" style="margin-left: 10px;" data-abb="'+abb+'" onclick="remAdd(this);">??????</button>' +
        '<button class="k-button" style="margin-left: 10px;" onclick="remCancel(this);">??????</button>' +
    '</div>');
}

function remCancel(obj) {
    $(obj).parent().remove();
}

function remAdd(obj) {
    var content = $(obj).prev().val();
    if (!content) {
        alert('????????????');
        return;
    }
    var abb = $(obj).attr('data-abb');
    $.ajax({
        url: route('home/rem/add'),
        type: 'post',
        dataType:"json",
        headers:{'token': decodeURIComponent(token)},
        data: {
            type: 'Credit',
            typeKey: abb,
            content: content
        },
        success: function(res) {
            // ?????????????????????????????????
            $('.cls_'+abb).find('.item').remove();
            $('.addRemInput').val('');
            fetchRemList(abb);
        }
    });
}

function fetchRemList(abb) {
    $.ajax({
        url: route('home/rem/list'),
        type: 'get',
        dataType:"json",
        headers:{'Content-Type':'application/json;charset=utf8','token': decodeURIComponent(token)},
        data: {
            type: 'Credit',
            typeKey: abb,
        },
        success: function(res) {
            var data = res.data;
            var str = '';
            for (var i = 0; i < data.length; i++) {
                str += '<p class="item">'+
                    '<span>'+data[i].typeId+'.</span>'+
                    '<span style="margin-left: 6px;">'+time(data[i].insert_time)+'</span>'+
                    '<span style="margin-left: 6px;">'+data[i].insert_person+'???</span>'+
                    '<span>'+data[i].content+'</span>'+
                '</p>';
            }
            $('.cls_'+abb).prepend(str);
        }
    });
}

function NotiSaleman(e) {
    var tr = e.target.closest("tr");
    var height = $('#grid').height();
    var c_data = $("#grid").data("kendoGrid").dataItem(tr);
    var company = c_data.company;
    $.ajax({
        url: route('home/notiClient/notiSaleman'),
        type: 'post',
        dataType:"json",
        headers:{'token': decodeURIComponent(token)},
        data: {
            company: company,
        },
        success: function(res) {
            TOAST(res.msg);
        }
    });
}