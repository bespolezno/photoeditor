$(".main").on('click', () => {
    $('.draggable').removeClass('selected');
});
let delDial = that => {
    $("#delete").dialog({
        modal: true,
        hide: "fade",
        show: "fade",
        draggable: false,
        title: "Удаление элемента",
        buttons:{
            'Удалить': function(){
                that.parent().remove();
                $(this).dialog( "close" );
            }
        }
    });
};
let add = (el) => {
    let z = getIndexesZ().map(el => el.zIndex);
    el.clone()
        .removeClass('addable')
        .appendTo('.holder')
        .resizable({
            aspectRatio: true,
        })
        .addClass('draggable')
        .on('click', function (e) {
            e.stopPropagation();
            $('.draggable').removeClass('selected');
            $(this).addClass('selected');
        })
        .draggable({
            containment: 'document',
            scroll: false,
            stack: '.sticker'
        })
        .css({
            zIndex: $('.holder').html() === '' ? 1 : z[z.length - 1],
            transform: 'rotate(0deg)',
            position: 'absolute',
            left: 0,
            top: 0,
            height: '150px',
            width: '150px'
        })
        .find('.cross')
        .on('click', function () {
            delDial($(this));
        });
};
$(".main-image").droppable({
    accept: ".addable",
    drop: function (event, ui) {
        add(ui.draggable);
    }
});
$('.sticker').draggable({
    containment: 'document',
    helper: "clone",
    scroll: false,
    stack: '.sticker'
}).on('dblclick', function () {
    add($(this))
});

let pressed = [];
let step = e => e.shiftKey ? 10 : 1;
let getIndexesZ = () => {
    let arr = [];
    $('.holder > .sticker').each(function () {
        arr.push({
            zIndex: $(this).css('z-index'),
            el: $(this)
        });
    });
    return arr.sort((a, b) => a.zIndex - b.zIndex);
};
let keys = {
    ArrowLeft: (s, e) => {
        s.css('left', parseInt(s.css('left')) - step(e));
    },
    ArrowRight: (s, e) => {
        s.css('left', parseInt(s.css('left')) + step(e));
    },
    ArrowUp: (s, e) => {
        s.css('top', parseInt(s.css('top')) - step(e));
    },
    ArrowDown: (s, e) => {
        s.css('top', parseInt(s.css('top')) + step(e));
    },
    PageUp: (s, e) => {
        let indexesZ = getIndexesZ();
        let z = indexesZ.map(el => el.zIndex);
        let els = indexesZ.map(el => el.el);
        let index = z.lastIndexOf(s.css('z-index'));
        if (index !== z.length - 1 &&
            s !== els[els.length - 1]) {
            s.css('z-index', parseInt(z[index]) + 1);
            els[index + 1].css('z-index', parseInt(z[index]) - 1);
        }
    },
    PageDown: (s, e) => {
        let indexesZ = getIndexesZ();
        let z = indexesZ.map(el => el.zIndex);
        let els = indexesZ.map(el => el.el);
        let index = z.indexOf(s.css('z-index'));
        if (index !== 0 &&
            s !== els[0]) {
            s.css('z-index', parseInt(z[index]) - 1);
            els[index - 1].css('z-index', parseInt(z[index]) + 1);
        }
    },
    Delete: (s, e) => {
        delDial(s);
    },
    '-': (s, e) => {
        let style = s.attr('style');
        let deg = parseInt(style.substr(style.indexOf("rotate(") + 7));
        deg -= step(e);
        s.css('transform', `rotate(${deg}deg)`);
    },
    '+': (s, e) => {
        let style = s.attr('style');
        let deg = parseInt(style.substr(style.indexOf("rotate(") + 7));
        deg += step(e);
        s.css('transform', `rotate(${deg}deg)`);
    }
};
window.onkeydown = window.onkeyup = e => {
    if (e.type === 'keydown' && !pressed.includes(e.key)
        && Object.keys(keys).includes(e.key))
        pressed.push(e.key);
    else if (pressed.includes(e.key))
        pressed.splice(pressed.indexOf(e.key), 1);
    let s = $('.selected');
    if (s.length > 0)
        pressed.forEach(k => keys[k](s, e));
};

let compile = () => {
    let stickers = [];
    $('.holder > .sticker').each(function () {
        let style = $(this).attr("style").split('; ');
        let ns = {src: $(this).find('.s').attr('src')};
        style.forEach(e => {
            let b = e.split(': ');
            if (b[0] === 'transform')
                ns[b[0]] = parseInt(b[1].slice(7, b[1].length - 1));
            else if (!isNaN(parseInt(b[1])))
                ns[b[0]] = parseInt(b[1]);
        });
        stickers.push(ns);
    });
    let main = {};
    let mainImg = $('#m');
    main.height = parseInt(mainImg.css('height'));
    main.width = parseInt(mainImg.css('width'));
    return {main, stickers, filters: getFilters()};
};
let defaultValues = {
    'sepia': 0,
    'brightness': 100,
    'contrast': 100,
    'grayscale': 0,
    'invert': 0,
    'saturate': 100,
    'blur': 0,
    'hue-rotate': 0
};
let getFilters = () => {
    let filters = {};
    $('.filter').each(function () {
        let id = $(this).find('input[type=range]').attr('id');
        let check = $(this).find('input[type=range]').val() != defaultValues[id];
        if (check) {
            filters[id] = $(this).find('input[type=range]').val() +
                {
                    'sepia': '%',
                    'brightness': '%',
                    'contrast': '%',
                    'grayscale': '%',
                    'invert': '%',
                    'saturate': '%',
                    'blur': 'px',
                    'hue-rotate': 'deg'
                }[id];
            $(this).addClass('changed');
        } else
            $(this).removeClass('changed');
    });
    return filters;
};

let changeFilters = () => {
    let filters = getFilters();
    console.log(filters);
    $('#m').css('filter', Object.keys(filters).map(el => `${el}(${filters[el]})`).join(' '));
};

$('input[type=range]').on('change', function () {
    $(this).parent().next().find('.change').text($(this).val());
    changeFilters();
});

$('#file').on('change', function () {
    if ($(this).get()[0].files[0].type.indexOf('image') !== -1) {
        $(this).parent().next().prepend(`<img src="${URL.createObjectURL($(this).get()[0].files[0])}" id="m" alt="mainImage">`);
        $(this).parent().prev().remove();
        $(this).parent().hide();
    }
});
$('.compile').on('click', () => console.log(compile()));