var dataSource;
var COMPANY;
var token = GetRequestSelf('token');
$(document).on('click','.k-grid-add',function(e){
    $.ajax({
        url: route('admin/credit/addId?token='+token),
        type: 'POST',
        dataType:"json",
        success: function(res) {
            dataSource._data[0].id = res.data[0].id;
        }
    });
});
$(document).ready(function () {
    var company = sessionStorage.getItem('creditCpy');
    COMPANY = company;
    dataSource = new kendo.data.DataSource({
        transport: {
            read:  {
                url: route('admin/credit/list'),
                type: 'post',
                dataType: "json"
            },
            update: {
                url: route('admin/credit/update?token='+token),
                type: 'put',
                dataType: "json"
            },
            destroy: {
                url: route('admin/credit/del?token='+token),
                type: 'delete',
                dataType: "json"
            },
            create: {
                url: route('admin/credit/add?token='+token),
                type: 'post',
                dataType: "json"
            },
            parameterMap: function(options, operation) {
                if (operation == "read") {
                    var company = sessionStorage.getItem('creditCpy');
                    if(company){
                        sessionStorage.removeItem('creditCpy');
                        $('#search').val(COMPANY);
                    }
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
                    company: {editable: false,defaultValue: COMPANY},
                    last_sale: { editable: false},
                    insert_person: { editable: false},
                    insert_time: { editable: false},
                    update_person: { editable: false},
                    update_time: { editable: false},
                    img: { editable: false},
                    credit_line: { 
                        type: "number",
                    },
                    credit_period: { 
                        type: "number",
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
            }else if(res.code!=200){
                TOAST(res.msg,'err');
                window.location.reload();
            }
        }
    });
    init();
});
function init(){
    var height = $('body').height()-3;
    $("#grid").kendoGrid({
        dataSource: dataSource,
        pageable: true,
        height: height,
        // toolbar: [{template: kendo.template('<button onclick="backTo();" class="k-button">??????</button>')},{template: kendo.template($("#template").html())}],
        toolbar: [{template: kendo.template('<button onclick="addNewCompany();" class="k-button">???????????????</button>')},"create",{name:"save",text:"??????"},"cancel",{template: kendo.template('<button onclick="backTo();" class="k-button">??????</button>')},{template: kendo.template($("#template").html())}],
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
        sortable: true,
        columns: [
            { field: "company", title: "????????????",width: '250px',editor: searchList},
            { field: "last_sale", title: "???????????????",width: '150px'},
            { field: "credit_line", title: "????????????",width: '150px'},
            { field: "credit_period", title: "????????????",width: '150px'},
            { field: "credit_time", title: "??????????????????",width: '150px',editor: regDate,format: "{0: yyyy-MM-dd}"},
            { field: "reason", title: "??????",width: '150px'},
            { field: "insert_person", title: "?????????",width: '150px'},
            { field: "insert_time", title: "????????????",width: '150px'},
            { field: "update_person", title: "?????????",width: '150px'},
            { field: "update_time", title: "????????????",width: '150px'},
            // { command: ['destroy'], title: "&nbsp;",width: '100px'}
        ],
        editable: true
    });
}
function searchList(container,options){
    var init_val,select_val;
    if(options.field=='company'){
        var url = route('common/fogSearchCustomerName');
        var required = 'required';
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
                searchHistoryData(select_val,options);
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
            }
        });
}

function addNewCompany() {
    initDialog({
        title:  '???????????????',
        content: '<input id="addNewCompany" style="width: 100%;" />',
        actions: [
            { text: '??????', primary: true , action: function(){
                var v = $('#addNewCompany').val();
                $('#dialog').remove();
                $.ajax({
                    url: route('admin/credit/add?token='+token),
                    type: 'POST',
                    data: {
                        models: JSON.stringify({
                            company: v,
                        })
                    },
                    dataType:"json",
                    success: function(res) {
                        TOAST(res.msg);
                    }
                });
            } },
            { text: '??????', action: function() {
                $('#dialog').remove();
            } }
        ],
    });
    $("#addNewCompany").kendoAutoComplete({
        dataTextField: "",
        filter: "contains",
        dataSource: {
            serverFiltering: true,
            transport: {
                read: route('common/fogSearchCustomerName')
            },
        },
    });
}

function backTo(){
    window.parent.$('#grid').show();
    window.parent.$('#in_frame').remove();
}

/* ?????????????????????????????????????????? */
function searchHistoryData(compnay,options){
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
            if(res.data[0]!=null){
                if(options.model.credit_line==0) options.model.credit_line = res.data[0].credit_line;
                if(options.model.credit_period==0) options.model.credit_period = res.data[0].credit_period;
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
function customValidation(models){
    var validate_arr = [
        {
            text: '????????????',
            value: 'company'
        },
        {
            text: '??????????????????',
            value: 'credit_time'
        }
    ];
    for (var j = 0; j < models.length; j++) {
        for (var i = 0; i < validate_arr.length; i++) {
            if(models[j][validate_arr[i].value]==undefined){
                TOAST(validate_arr[i].text+'????????????');
                return 0;
                break;
            }else if(j==models.length-1&&i==validate_arr.length-1&&models[j][validate_arr[i].value]!=undefined){
                return 1;
            }
        }
    }
}
function upload(e){
    var tr = $(e.target).closest("tr");
    var data = this.dataItem(tr);
    var id = data.id;
    $('input[type=file]').attr('data-id',id);
    upload_data = data;
    upload_e = e.target;
    $('input[type=file]').click();
}
function uploadImg(obj){
    var data = new FormData();
    var ele = document.getElementById('f');
    var id = $('input[type=file]').attr('data-id');
    data.append("img", ele.files[0]);
    data.append("id",id);
    $.ajax({
        url: route('admin/credit/uploadImg'),
        type: 'POST',
        data: data,
        dataType:"json",
        cache: false,
        contentType: false, //???????????????
        processData: false, //???????????????
        success: function(res) {
            $('input[type=file]').val('');
            TOAST(res.msg);
            if(res.code==200){
                $('#grid').data("kendoGrid").dataSource.read();
            }   
        }
    });
}
function delImg(e){
    var tr = $(e.target).closest("tr");
    var data = this.dataItem(tr);
    var id = data.id;
    var content = '';
    if(data.img==''||data.img==null) return;
    var album_arr = data.img.split(',');
    album_arr.forEach(function(items,index){
        content += '<p>'+
                        '<label>'+
                            '<input type="checkbox" name="img" value="'+items+'"/>'+
                            '<span>'+items+'</span>'+
                        '<label>'+
                    '</p>';
    });
    initDialog({
        title: "????????????",
        content: content,
        actions: [
            { text: '??????', primary: true , action: function(){
                del(e,data);
            } },
            { text: '??????', action: cancel }
        ]
    });
}
function del(e,data){
    var id = data.id;
    var album_arr = [];
    $('input[name=img]:checked').each(function(){
        album_arr.push($(this).val());
    });
    cancel();
    if(album_arr[0]==null) return;
    album_arr = JSON.stringify(album_arr);
    $.ajax({
        url: route('admin/credit/delImg'),
        type: 'POST',
        data: {
            id: id,
            album_arr: album_arr
        },
        dataType:"json",
        success: function(res) {
            TOAST(res.msg);
            $('#grid').data("kendoGrid").dataSource.read();
        }
    });
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
function photo(obj){
    var src = $(obj).attr('src');
    window.top.open(src);
}
function initDialog(option){
    var str = '<div id="dialog" style="font-size: 14px;"></div>';
    $('body').append(str);
    $('#dialog').kendoDialog({
        width: "400px",
        title: option.title,
        closable: false,
        modal: true,
        content: option.content,
        actions: option.actions
    });
}
function cancel(){
    $('.k-dialog,.k-overlay').remove();
}