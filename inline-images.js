// (c) 2011-2013 Alexander Solovyov
// under terms of ISC License

var IMAGE_SERVICES = [
    {
        test: new RegExp('^https?://www.dropbox.com/.*(png|jpg|jpeg|gif)$', 'i'),
        link: function(href) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( 'GET', href, false );
            xmlHttp.send( null );
            var response = xmlHttp.responseText;
            if (response.indexOf('preview-photo') != -1)
                return response.split('class="chat-bubble freshdropdown-menu"><ul><li><a href="')[1].split('" id="download_button_link"')[0];
            else
                return null;
        }
    },
    {test: /\.(png|jpg|jpeg|gif)$/i},
    {test: new RegExp('^https://i.chzbgr.com/')},
    {test: new RegExp('^http://img-fotki.yandex.ru/get/')},
    {test: new RegExp('^http://img.leprosorium.com/')},
    {
        test: new RegExp('^https?://(www\\.)?monosnap.com/image/', 'i'),
        link: function(href) {
            return 'http://api.monosnap.com/image/download?id=' +
                href.match(/(\w+)\/?$/)[1];
        }
    },
    {
        // all links which do not have slash as a second character in path,
        // because imgur.com/a/stuff is an album and not an image
        test: new RegExp('^http://imgur.com/.[^/]', 'i'),
        link: function(href) {
            return href.replace('imgur.com', 'i.imgur.com') + '.jpg';
        }
    },
    {
        test: new RegExp('^http://cl.ly/', 'i'),
        link: function(href) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('GET', href, false);
            xmlHttp.send(null);
            var response = xmlHttp.responseText;
            if (response.indexOf('<body id="image">') != -1)
                return response.split(' class="embed" href="')[1].split('">Direct link</a>')[0];
            else
                return null;
        }
    }
];

function inlineImage(node, imageUrl) {
    var shouldScroll = coalescedHTML.shouldScroll || nearBottom();

    var img = document.createElement("img");
    img.src = imageUrl;
    img.className = 'inlineImage';
    img.setAttribute('data-txt', node.innerHTML);
    img.setAttribute('data-href', node.href);
    img.setAttribute('style', 'max-width: 100%; max-height: 100%;');

    node.parentNode.replaceChild(img, node);
    img.addEventListener('click', revertImage);

    if (shouldScroll) {
        img.addEventListener('load', scrollToBottom);
    }
}


function revertImage(e) {
    e.preventDefault();
    e.stopPropagation();

    var node = e.target;
    var a = document.createElement('a');
    a.href = node.getAttribute('data-href');
    a.innerHTML = node.getAttribute('data-txt');

    node.parentNode.replaceChild(a, node);
}


function handleLink(target) {
    var srv,
        matches,
        href = target.href;

    for (var i = 0; i < IMAGE_SERVICES.length; i++) {
        srv = IMAGE_SERVICES[i];
        matches = typeof srv.test === 'function' ?
            srv.test(href) :
            href.match(srv.test);

        if (matches) {
            inlineImage(target, srv.link ? srv.link(href) : href);
            return;
        }
    }
}


document.getElementById('Chat').addEventListener('DOMNodeInserted', function(e) {
    var anchors = e.target.getElementsByTagName("a");

    for(var i = 0; i < anchors.length; i++) {
        var anchor = anchors.item(i);
        handleLink(anchor);
    }
});
