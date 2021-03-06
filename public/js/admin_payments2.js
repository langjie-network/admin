var ID;
var token = encodeURIComponent(GetRequestSelf('token'));
$(document).ready(function () {
    dataSource = new kendo.data.DataSource({
        transport: {
            read:  {
                url: route('admin/payments/list'),
                type: 'post',
                dataType: "json"
            },
            update: {
                url: route('admin/payments/update?token='+token),
                type: 'put',
                dataType: "json"
            },
            destroy: {
                url: route('admin/payments/del?token='+token),
                type: 'delete',
                dataType: "json"
            },
            create: {
                url: route('admin/payments/add?token='+token),
                type: 'post',
                dataType: "json",
            },
            parameterMap: function(options, operation) {
                if (operation == "read") {
                    var parameter = {
                        page: options.page,
                        pageSize: options.pageSize,
                        keywords: $('#search').val()
                    };
                    if(options.sort&&options.sort.length!=0){
                        parameter.field = options.sort[0].field;
                        parameter.dir = options.sort[0].dir;
                    }
                    return {models: kendo.stringify(parameter)};
                }else if(operation=='update'||operation=='add'){
                    if(customValidation(options.models))
                        return {models: kendo.stringify(options.models)};
                }else{
                    return {models: kendo.stringify(options.models)};
                }
            }
        },
        batch: true,
        pageSize: 30,
        serverPaging: true,
        serverSorting: false,
        schema: {
            model: {
                id: "id",
                fields: {
                    id: { editable: false, nullable: true },
                    isAssign: { editable: false},
                    insert_person: { editable: false},
                    insert_time: { editable: false},
                    update_person: { editable: false},
                    update_time: { editable: false},
                    img: { editable: false},
                    company: { 
                        validation: { required: true,required: { message:'??????????????????'}},
                    },
                    amount: { 
                        type: "number",
                        validation: { required: true,required: { message:'??????????????????'}},
                    },
                    method: { 
                        defaultValue: "??????"
                    },
                    arrival: { 
                        defaultValue: new Date()
                    }
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
            var res = e.response; 
            if(res.code==2000){
                TOAST(res.msg);
                $('#grid').data("kendoGrid").dataSource.read();
                // tr_index_arr = [];
                // $('.k-auto-scrollable tbody>.k-detail-row').each(function(){
                //     if($(this).css('display')!='none'){
                //         var prev = $(this).prev();
                //         var index = $('.k-master-row').index(prev);
                //         tr_index_arr.push(index);
                //     }
                // });
            }
        }
    });
    init();
});
//??????????????????
$(document).on('click','.k-detail-row .k-grid-footer .k-grid-add',function(e){
    var tr = $(e.target).closest('tr').prev();
    var _d = $("#grid").data('kendoGrid').dataItem(tr);
    var grid = $(e.target).closest('.k-grid').data("kendoGrid");
    var table = $(e.target).closest('.k-grid');
    var len = table.find('tr').length;
    grid.dataSource.insert(len,{});
    grid.editRow($(table).find('tr:eq('+(len)+')'));
});
//??????????????????
$(document).on('click','.k-detail-row .k-grid-footer .k-grid-cancel-changes',function(e){
    $(this).parent().parent().find('.k-grid-toolbar .k-grid-cancel-changes').trigger('click');
});
//??????????????????
$(document).on('click','.k-detail-row .k-grid-footer .k-grid-save-changes',function(e){
    var d = $(e.target).closest('.k-grid');
    var tr = d.closest('tr').prev();
    //????????????
    var amount = $('#grid').data('kendoGrid').dataItem(tr).amount;
    //??????id
    var id = $('#grid').data('kendoGrid').dataItem(tr).id;
    var sum = 0;
    var obj = {};
    var history_arr = [];
    //??????????????????
    $(e.target).closest('.k-grid').find('.k-grid-content tr').each(function(){
        var _data = $(e.target).closest('.k-grid').data('kendoGrid').dataItem($(this));
        var contract_no = _data.contract_no;
        var ishistory = _data.ishistory;
        if(!ishistory){
            sum += _data.amount;
            //???checkSameContract()?????????????????????????????????
            if(obj[contract_no]){
                obj[contract_no]++;
            }else{
                obj[contract_no] =1;
            }
        }else{
            history_arr.push({
                contract_no: contract_no,
                amount: _data.amount
            });
        }
    });
    function checkSameContract(){
        for(var key in obj){
            if(obj[key]>1){
                return 1;
            }
        }
        return 0;
    }
    if(checkSameContract()){
        TOAST('????????????');
        return;
    }
    $(e.target).closest('.k-grid').find('.k-grid-content tr').each(function(){
        var _data = $(e.target).closest('.k-grid').data('kendoGrid').dataItem($(this));
        var contract_no = _data.contract_no;
        var sum = 0;
        history_arr.forEach(function(items,index){
            if(contract_no==items.contract_no){
                sum += items.amount;
                _data.history_amount = sum;
                // _data.history_amount = items.amount;
            }
        });
    });
    if(amount==sum){
        //??????payments??????????????????
        updateAssign(id,1);
    }else if(amount<sum){
        TOAST('?????????????????????????????????');
        return;
    }else{
        //??????payments?????????????????????
        updateAssign(id,0);
    }
    $(this).parent().parent().find('.k-grid-toolbar .k-grid-save-changes').trigger('click');
});
function detailInit(e) {
    if(!e.data.id) {
        TOAST('???????????????');
        return;
    }
    ID = e.data.id;
    var dataSourceSecond = new kendo.data.DataSource({
        transport: {
            read: {
                url: route('admin/payments/payUse?id='+e.data.id)
            },
            update: {
                url: route('admin/payUse/update?token='+token),
                type: 'put',
                dataType: "json"
            },
            destroy: {
                url: route('admin/payUse/del?token='+token),
                type: 'delete',
                dataType: "json"
            },
            create: {
                url: route('admin/payUse/add?token='+token),
                type: 'post',
                dataType: "json"
            },
            parameterMap: function(options, operation) {
                if(operation=='create'){
                    options.models.forEach(function(items,index){
                        items.pay_id = ID;
                    });
                }
                return {models: kendo.stringify(options.models)};
            }
        },
        batch: true,
        serverPaging: true,
        schema: {
            model: {
                id: "id",
                fields: {
                    id: { editable: false, nullable: true },
                    amount: { type: "number" },
                }
            },
        },
        requestEnd: function (res) {  
            res = res.response;
            if(res.code==2000){
                TOAST(res.msg);
                $('#grid').data("kendoGrid").dataSource.read();
            }
        }
    });
    $("<div/>").appendTo(e.detailCell).kendoGrid({
        dataSource: dataSourceSecond,
        toolbar: ["create","save","cancel"],
        columns: [
            { field: "type", title:"??????", width: "150px",editor: selectList },
            { field: "contract_no", title:"????????????", width: "150px",editor: searchList },
            { field: "amount", title:"??????", width: "150px",template: function(dataItem){
                if(!dataItem.ishistory){
                    return '<span>'+dataItem.amount+'</span>';
                }else{
                    return '<span class="history" title="????????????">'+dataItem.amount+'</span>';
                }
            } },
            { field: "rem", title: "??????", width: "300px" },
            { command: ["destroy"], title: "&nbsp;",width: '100px'}
        ],
        editable: true
    });
    var str = $(e.detailCell).find('.k-grid>.k-header').html();
    $(e.detailCell).find('.k-grid>.k-header').hide();
    $(e.detailCell).find('.k-grid').append('<div class="k-grid-footer" style="padding:7px;" tabindex="-1">'+str+'</div>');
}
function init(){
    var height = $('body').height()-3;
    $("#grid").kendoGrid({
        dataSource: dataSource,
        pageable: true,
        height: height,
        toolbar: ["create",{name:"save",text:"??????"},"cancel",{template: kendo.template($("#template").html())}],
        pageable: {
            refresh: true,
            buttonCount: 5,
            page: 1,
            pageSize: 30,
            pageSizes: [10,30,50,100,200],
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
        detailInit: detailInit,
        dataBound: function() {
            // if(tr_index_arr[0]==null) return;
            // var that = this;
            // tr_index_arr.forEach(function(items,index){
            //     that.expandRow(that.tbody.find("tr.k-master-row").eq(items));
            // });
        },
        sortable: true,
        columns: [
            { field: "company", title: "????????????",width: '250px',editor: searchList},
            { field: "method", title: "????????????",width: '150px',editor: selectList},
            { field: "arrival", title: "????????????",width: '150px',editor: regDate,format: "{0: yyyy-MM-dd}"},
            { field: "amount", title: "????????????",width: '150px',template: function(dataItem){
                var assign = dataItem.isAssign;
                if(!assign){
                    return '<span class="assign" title="???????????????">'+dataItem.amount+'</span>';
                }else{
                    return '<span>'+dataItem.amount+'</span>';
                }
            }},
            { field: "insert_person", title: "?????????",width: '150px'},
            { field: "insert_time", title: "????????????",width: '150px'},
            { field: "update_person", title: "?????????",width: '150px'},
            { field: "update_time", title: "????????????",width: '150px'},
            { command: ['destroy'], title: "&nbsp;",width: '100px'}],
        editable: true
    });
    
}

function selectList(container,options){
    if(options.field=='method'){
        var data = ['??????','??????','??????','??????'];
    }else if(options.field=='type'){
        var data = ['??????','??????','??????','?????????'];
    }
    $('<input required name="' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            autoBind: true,
            dataSource: {
                data: data
            }
        });
}
function searchList(container,options){
    var init_val,select_val;
    if(options.field=='company'){
        var url = route('common/fogSearchCustomerName');
        var required = 'required';
    }else if(options.field=='contract_no'){
        var k = container.closest('.k-grid');
        var tr = k.closest('tr').prev();
        var _data = $('#grid').data('kendoGrid').dataItem(tr);
        // var abb = _data.abb;
        var company = _data.company;
        var url = route('admin/payments/searchContractNo?company='+company);
        var required = '';
    }
    $('<input '+required+' name="' + options.field + '"/>')
        .appendTo(container)
        .kendoAutoComplete({
            dataSource: {
                serverFiltering: true,
                transport: {
                    read: {
                        url: url
                    }
                }
            },
            clearButton: false,
            select: function(t){
                select_val = t.dataItem;
            },
            open: function(e){
                init_val = e.sender.dataSource._data[0];
            },
            close: function(e){
                var end_val = container.find('input').val();
                if(select_val){
                    if(select_val!=end_val){
                        container.find('input').val(init_val);
                    }
                }else{
                    container.find('input').val(init_val);
                }
                var v = container.find('input').val();
                var id = container.closest('.k-grid').attr('id');
                //?????????????????????????????????
                if(id==undefined){
                    $.ajax({
                        url: route('admin/payments/getAmount?token='+token),
                        type: 'get',
                        data: {
                            contract_no: v
                        },
                        dataType:"json",
                        success: function(res) {
                            var amount = res.data;
                            var grid = container.closest('.k-grid');
                            var tr = container.closest('tr');
                            var _d = grid.data('kendoGrid').dataItem(tr);
                            _d.amount = amount;
                            container.next().find('span').text(amount);
                        }
                    });
                }
            }
        });
}
function regDate(container, options){
    $('<input required name="' + options.field + '"/>')
        .appendTo(container)
        .kendoDatePicker({
            format: "yyyy-MM-dd",
            parseFormats: ["yyyy-MM-dd"]
        });
}
//????????????????????????
function updateAssign(id,isAssign){
    $.ajax({
        url: route('admin/payments/updateAssign?token='+token),
        type: 'POST',
        data: {
            id: id,
            isAssign: isAssign
        },
        dataType:"json",
        success: function(res) {
             
        }
    });
}

function customValidation(models){
    var validate_arr = [
        {
            text: '????????????',
            value: 'company'
        },
        {
            text: '????????????',
            value: 'method'
        },
        {
            text: '????????????',
            value: 'arrival'
        },
        {
            text: '????????????',
            value: 'amount'
        }
    ];
    for (var j = 0; j < models.length; j++) {
        for (var i = 0; i < validate_arr.length; i++) {
            if(models[j][validate_arr[i].value]==undefined||models[j][validate_arr[i].value]==0){
                TOAST(validate_arr[i].text+'????????????');
                return 0;
                break;
            }else if(j==models.length-1&&i==validate_arr.length-1&&models[j][validate_arr[i].value]!=undefined){
                return 1;
            }
        }
    }
}
function search(){
    $('#grid').data("kendoGrid").dataSource.options.page = 1;
    $('#grid').data("kendoGrid").dataSource.read();
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
    // window.top.$("body").append(html);
    $("body").append(html);
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