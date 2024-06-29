/* SPA Strategy*/
(function() {

    var partialsCache = {};

    function fetchFile(path, callback) {
        var request = new XMLHttpRequest();

        request.onload = function() {
            callback(request.responseText);
        };
        request.open("GET", path);
        request.send(null); 
    }

    function getContent(fragmentId, callback) {

        if (partialsCache[fragmentId]) {
            callback(partialsCache[fragmentId]);
        } else {
            fetchFile(fragmentId + ".html", function(content) {
                partialsCache[fragmentId] = content;
                callback(content);
            });
        }
        fetchFile(fragmentId + ".html", callback);
    }

    if (!location.hash) {
        location.hash = "#home";
    }

    function setActiveLink(fragmentId) {

        var navbarDiv = document.querySelectorAll(".navbar-nav .nav-item .nav-link"),
        links = navbarDiv, i, link, pageName;

        for(i = 0; i < links.length; i++) {
            link = links[i]; 
            pageName = link.getAttribute("href") !== null ? link.getAttribute("href").substring(1) : '';
            if (pageName === fragmentId) {
                link.setAttribute("style", "color: aliceblue; pointer-events: none; cursor: default;");
            } else {
                link.removeAttribute("style");
            }
        }
    }

    function navigate() {
        var contentDiv = document.getElementById("content"),
        fragmentId = location.hash.substring(1);

        getContent(fragmentId, function(content){
            contentDiv.innerHTML = content;
        });
        setActiveLink(fragmentId);
        document.body.style.display = "block";
    }
    navigate();
    window.addEventListener("hashchange", navigate);

}());

/* Send Email via SMTPJS */
function sendMail() {
    document.getElementById('contact-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const output = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${this.name.value}</li>
            <li>Fone: ${this.fone.value}</li>
            <li>Email: ${this.email.value}</li>
        </ul>
        <h3>Message</h3>
        <p>${this.textMessage.value}</p>
        `;
        const nome = this.name.value;
        loading = document.querySelector('.loading');
        loading.style.display = 'block';
        await Email.send({
            SecureToken: "f1b5d77b-b43a-40aa-8d40-f165fe255e10",
            To: 'emporiosaudecuritiba@gmail.com',
            From: "emporiosaudecuritiba@gmail.com",
            Subject: this.subject.value,
            Body: output
        }).then(
            /* message => alert(`Obrigado pela visita Sr(a) ${nome}, entrarei em contato o mais breve possível!`) */
            message => modalSet('modal', `${nome}, Have a great day.`),
            document.getElementById('contact-form').reset()
        );
    });
}

/* SmtpJS.com - v3.0.0 */
var Email = {
    send: function (a) {
        return new Promise(function (n, e) {
            a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send";
            var t = JSON.stringify(a);
            Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, 
            function (e) { n(e) })
        })
    }, ajaxPost: function (e, n, t) {
        var a = Email.createCORSRequest("POST", e);
        a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), 
        a.onload = function () {
            var e = a.responseText; null != t && t(e)
        }, a.send(n)
    }, ajax: function (e, n) {
        var t = Email.createCORSRequest("GET", e);
        t.onload = function () {
            var e = t.responseText; null != n && n(e)
        }, t.send()
    }, createCORSRequest: function (e, n) {
        var t = new XMLHttpRequest;
        return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t
    }
};

/* Modal Confirm */
function modalSet(id, msg) {
    const submitBtn = document.getElementById('btnSendMail');
    document.getElementById("return").innerHTML = msg;
    $("#".concat(id)).modal("show");
    modal.addEventListener('click', (e) => {
        if (e.target.id == id || e.target.className == 'btn btn-danger' || e.target.className == 'close') {
            $("#".concat(id)).modal("hide");
            loading.style.display = 'none';
            submitBtn.setAttribute('disabled', true);
        }
    });
}

/* Fields Validation */
function validateFields() {
    document.getElementById('name').addEventListener('input', function (e) {
        let count = '';
        span_name = document.querySelector('.msg-name');
        e.target.value = e.target.value.replace(/[^ a-zA-Z]+/g, '');
        if (e.target.value.length < 3) {
            span_name.innerHTML = "Preenchimento mínimo de 3 caracteres!";
            span_name.style.display = 'block';
            count += 1;
        } else {
            span_name.style.display = 'none';
        }
        validator(count);
    });
    document.getElementById('email').addEventListener('input', function (e) {
        let count = '';
        span_email = document.querySelector('.msg-email');
        const testEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if (e.target.value.length > 3) {
            if (testEmail.test(e.target.value)) {
                span_email.style.display = 'none';
            } else {
                span_email.innerHTML = "Formato do E-mail inválido";
                span_email.style.display = 'block';
                count += 1;
            }
            validator(count);
        }
    });
}

function validator(count) {
    const invalidForm = document.querySelector('form:invalid');
    const submitBtn = document.getElementById('btnSendMail');
    if (invalidForm || count != '') {
        submitBtn.setAttribute('disabled', true);
    } else {
        submitBtn.disabled = false;
    }
}

function mask() {
    document.getElementById('fone').addEventListener('input', function (e) {
        var aux = e.target.value.length < 15 ? e.target.value.replace(/\D/g, '')
            .match(/(\d{0,2})(\d{0,4})(\d{0,4})/) : e.target.value.replace(/\D/g, '')
            .match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !aux[2] ? aux[1] : '(' + aux[1] + ') ' + aux[2] + (aux[3] ? '-' + aux[3] : '');
    });
}