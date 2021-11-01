 $(function() {
    $.fn.initInputGroup = function () {
        var c = $.extend({
            add: "<i class=\"bi bi-patch-plus\"></i>",
            del: "<i class=\"bi bi-patch-minus\"></i>",
            //data: []
        });



        var _this = $(this);

        addInputGroup(1);

        function addInputGroup(order) {

            var inputGroup = $("<div class=\"task-status\"></div>");

            var inputGroupAddon1 = $("<div class=\"task-status-id\"></div>");

            inputGroupAddon1.html(" " + order + " ");

            var widget = $("<input maxlength=\"250\" class=\"task-status-content\" type=\"text\" placeholder=\"任务阶段描述\" id=\"s"+order+"\"/>");
            //widget.val(data[order-1]);
            var addBtn = $("<div class=\"task-status-finish\">"+c.add+"</div>");

            addBtn.on('click', function() {
                if($(this).html() == c.del) {
                    $(this).parents('.task-status').remove();
                } else if($(this).html() == c.add) {
                    $(this).html(c.del);
                    addInputGroup(order+1);
                }
                resort();
            });

            inputGroup.append(inputGroupAddon1).append(widget).append(addBtn);

            _this.append(inputGroup);

        /*  if(order + 1 > c.data.length) {
                return;
            } */
            //addBtn.trigger('click');
        }

        function resort() {
            var child = _this.children();
            $.each(child, function(i) {
                $(this).find(".task-status-id").html(' ' + (i + 1) + ' ');
                $(this).find(".task-status-content").attr('id','s' + (i + 1));
            });
        }
    }

    $.fn.initNameGroup = function () {
        var c = $.extend({
            add: "<i class=\"bi bi-patch-plus\"></i>",
            del: "<i class=\"bi bi-patch-minus\"></i>",
            //data: []
        });


        var _this = $(this);

        addNameGroup(1);

        function addNameGroup(order) {

            var inputGroup = $("<div class=\"task-status\"></div>");

            var inputGroupAddon1 = $("<div class=\"task-status-id\"></div>");

            inputGroupAddon1.html(" " + order + " ");

            var widget = $("<input maxlength=\"18\" class=\"task-status-content\" type=\"text\" placeholder=\"分配任务员工身份证号\" id=\"sa"+order+"\"/>");
            //widget.val(data[order-1]);
            var addBtn = $("<div class=\"task-status-finish\">"+c.add+"</div>");

            addBtn.on('click', function() {
                if($(this).html() == c.del) {
                    $(this).parents('.task-status').remove();
                } else if($(this).html() == c.add) {
                    $(this).html(c.del);
                    addNameGroup(order+1);
                }
                resort();
            });

            inputGroup.append(inputGroupAddon1).append(widget).append(addBtn);

            _this.append(inputGroup);

        /*  if(order + 1 > c.data.length) {
                return;
            } */
            //addBtn.trigger('click');
        }

        function resort() {
            var child = _this.children();
            $.each(child, function(i) {
                $(this).find(".task-status-id").html(' ' + (i + 1) + ' ');
                $(this).find(".task-status-content").attr('id','sa' + (i + 1));
            });
        }
    }


    $.fn.initInputGroup2 = function () {
        var c = $.extend({
            finish: "<i class=\"bi bi-clipboard-check\"></i>",
            doing: "<i class=\"bi bi-clipboard-data\"></i>",
            waiting: "<i class=\"bi bi-clipboard\"></i>",
            description: [],
            status: [],
            taskid:null,
            select:null
        });



        var _this = $(this);

        addInputGroup(1);

        function addInputGroup(order) {
            if(order>status.length){
                return;
            }

            var inputGroup = $("<div class=\"task-status\"></div>");

            var inputGroupAddon1 = $("<div class=\"task-status-id\"></div>");

            inputGroupAddon1.html(" " + order + " ");

            var widget = $("<input maxlength=\"250\" class=\"task-status-content\" type=\"text\" readonly=\"readonly\"/>");
            //widget.val(data[order-1]);
            var addBtn = $("<div class=\"task-status-finish\"></div>");
            if(status[order-1]=='已完成'){
                addBtn.html(finish);
            }else if(status[order-1]=='进行中'){
                addBtn.html(doing);
                data={id:order,taskid:taskid}
                addBtn.on('click',function(){
                    $.ajax({
                        type: 'POST',
                        url: '/finishstage',
                        data: data,
                        success: function (data) {
                          if (data.state == "Updated") {
                            alert('操作成功！');
                            $("#close2").
                          } else {
                            alert('操作失败！');
                          }
                        },
                        error: function () {
                          alert('因其他原因操作失败');
                        }
                    })
                })
            }else{
                addBtn.html(waiting);
            }

            addBtn.on('click', function() {
                if($(this).html() == c.del) {
                    $(this).parents('.task-status').remove();
                } else if($(this).html() == c.add) {
                    $(this).html(c.del);
                    addInputGroup(order+1);
                }
                resort();
            });

            inputGroup.append(inputGroupAddon1).append(widget).append(addBtn);

            _this.append(inputGroup);
        }
    }
});