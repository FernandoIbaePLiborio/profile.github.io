
var dataObject = {};
function displayData(id, data) {
    var htmlObj, htmlTemplate, html, arr = [], a, l, rowClone, x, j, i, ii, cc, repeat, repeatObj, repeatX = "";
    htmlObj = document.getElementById(id);
    htmlTemplate = initTemplate(id, htmlObj);
    html = htmlTemplate.cloneNode(true);
    arr = getElementsByAttribute(html, "repeat");
    l = arr.length;
    for (j = (l - 1); j >= 0; j -= 1) {
        cc = arr[j].getAttribute("repeat").split(" ");
        if (cc.length == 1) {
            repeat = cc[0];
        } else {
            repeatX = cc[0];
            repeat = cc[2];
        }
        arr[j].removeAttribute("repeat");
        repeatObj = data[repeat];
        if (repeatObj && typeof repeatObj == "object" && repeatObj.length != "undefined") {
            i = 0;
            for (x in repeatObj) {
                i += 1;
                rowClone = arr[j];
                rowClone = needleInHaystack(rowClone, "element", repeatX, repeatObj[x]);
                a = rowClone.attributes;
                for (ii = 0; ii < a.length; ii += 1) {
                    a[ii].value = needleInHaystack(a[ii], "attribute", repeatX, repeatObj[x]).value;
                }
                (i === repeatObj.length) ? arr[j].parentNode.replaceChild(rowClone, arr[j]) : arr[j].parentNode.insertBefore(rowClone, arr[j]);
            }
        } else {
            console.log("repeat must be an array. " + repeat + " is not an array.");
            continue;
        }
    }
    html = needleInHaystack(html, "element");
    htmlObj.parentNode.replaceChild(html, htmlObj);
    function initTemplate(id, obj) {
        var template;
        template = obj.cloneNode(true);
        if (dataObject.hasOwnProperty(id)) { return dataObject[id]; }
        dataObject[id] = template;
        return template;
    }
    function getElementsByAttribute(x, att) {
        var arr = [], arrCount = -1, i, l, y = x.getElementsByTagName("*"), z = att.toUpperCase();
        l = y.length;
        for (i = -1; i < l; i += 1) {
            if (i == -1) { y[i] = x; }
            if (y[i].getAttribute(z) !== null) { arrCount += 1; arr[arrCount] = y[i]; }
        }
        return arr;
    }
    function needleInHaystack(elmnt, typ, repeatX, x) {
        var value, rowClone, pos1, haystack, pos2, needle = [], needleToReplace, i, cc, r;
        rowClone = elmnt.cloneNode(true);
        pos1 = 0;
        while (pos1 > -1) {
            haystack = (typ == "attribute") ? rowClone.value : rowClone.innerHTML;
            pos1 = haystack.indexOf("{{", pos1);
            if (pos1 === -1) { break; }
            pos2 = haystack.indexOf("}}", pos1 + 1);
            needleToReplace = haystack.substring(pos1 + 2, pos2);
            needle = needleToReplace.split("||");
            value = undefined;
            for (i = 0; i < needle.length; i += 1) {
                needle[i] = needle[i].replace(/^\s+|\s+$/gm, ''); //trim
                //value = ((x && x[needle[i]]) || (data && data[needle[i]]));
                if (x) { value = x[needle[i]]; }
                if (value == undefined && data) { value = data[needle[i]]; }
                if (value == undefined) {
                    cc = needle[i].split(".");
                    if (cc[0] == repeatX) { value = x[cc[1]]; }
                }
                if (value == undefined) {
                    if (needle[i] == repeatX) { value = x; }
                }
                if (value == undefined) {
                    if (needle[i].substr(0, 1) == '"') {
                        value = needle[i].replace(/"/g, "");
                    } else if (needle[i].substr(0, 1) == "'") {
                        value = needle[i].replace(/'/g, "");
                    }
                }
                if (value != undefined) { break; }
            }
            if (value != undefined) {
                r = "{{" + needleToReplace + "}}";
                if (typ == "attribute") {
                    rowClone.value = rowClone.value.replace(r, value);
                } else {
                    w3ReplaceHTML(rowClone, r, value);
                }
            }
            pos1 = pos1 + 1;
        }
        return rowClone;
    }
    function w3ReplaceHTML(a, r, result) {
        var b, l, i, a, x, j;
        if (a.hasAttributes()) {
            b = a.attributes;
            l = b.length;
            for (i = 0; i < l; i += 1) {
                if (b[i].value.indexOf(r) > -1) { b[i].value = b[i].value.replace(r, result); }
            }
        }
        x = a.getElementsByTagName("*");
        l = x.length;
        a.innerHTML = a.innerHTML.replace(r, result);
    }
}

function includeHTML(cb) {
    var z, i, elmnt, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    elmnt.innerHTML = this.responseText;
                    elmnt.removeAttribute("include-html");
                    includeHTML(cb);
                }
            }
            if ("withCredentials" in xhttp) {
                // XHR for Chrome/Firefox/Opera/Safari.
                xhttp.open("GET", file, true);
            } else if (typeof XDomainRequest != "undefined") {
                // XDomainRequest for IE.
                xhr = new XDomainRequest();
                xhr.open("GET", file, true);
            }
            xhttp.send();
            return;
        }
    }
    if (cb) cb();
}

function http(target, readyfunc, xml, method) {
    var httpObj;
    if (!method) { method = "GET"; }
    if (window.XMLHttpRequest) {
        httpObj = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        httpObj = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (httpObj) {
        if (readyfunc) { httpObj.onreadystatechange = readyfunc; }
        httpObj.open(method, target, true);
        httpObj.send(xml);
    }
}

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

        await Email.send({
            SecureToken: "b4b1e026-e9df-45da-8742-f0876782c3dc",
            To: 'nandotromp@gmail.com',
            From: "emporiosaudecuritiba@gmail.com",
            Subject: this.subject.value,
            Body: output
        }).then(
            message => alert(`Obrigado pela visita Sr(a) ${nome}, entrarei em contato o mais breve possível!`)
        );
        loading.style.display = 'none';
        document.getElementById('contact-form').reset();
    });
}

/* SmtpJS.com - v3.0.0 */
var Email = {
    send: function (a) {
        return new Promise(function (n, e) {
            loading = document.querySelector('.loading');
            loading.style.display = 'block';
            a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send";
            var t = JSON.stringify(a);
            Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) })
        })
    }, ajaxPost: function (e, n, t) {
        var a = Email.createCORSRequest("POST", e);
        a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () {
            var e = a.responseText; null != t && t(e)
        }, a.send(n)
    }, ajax: function (e, n) {
        var t = Email.createCORSRequest("GET", e); t.onload = function () {
            var e = t.responseText; null != n && n(e)
        }, t.send()
    }, createCORSRequest: function (e, n) {
        var t = new XMLHttpRequest;
        return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t
    }
};

/* Validação de Email */
function validateFields() {
    const filtro = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    const invalidForm = document.querySelector('form:invalid');
    const submitBtn = document.getElementById('btnSendMail');
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    let contErro = '';
    caixa_nome = document.querySelector('.msg-name');
    caixa_email = document.querySelector('.msg-email');
    if (email.value == "") {
        caixa_email.innerHTML = "Favor preencher o E-mail";
        caixa_email.style.display = 'block';
        contErro += 1;
    } else if (filtro.test(email.value)) {
        caixa_email.style.display = 'none';
    } else {
        caixa_email.innerHTML = "Formato do E-mail inválido";
        caixa_email.style.display = 'block';
        contErro += 1;
    }
    if (name.value == '') {
        caixa_nome.innerHTML = "Favor preencher o Nome";
        caixa_nome.style.display = 'block';
        contErro += 1;
    } else {
        caixa_nome.style.display = 'none';
    }
    if (invalidForm || contErro != '') {
        submitBtn.setAttribute('disabled', true);
    } else {
        submitBtn.disabled = false;
    }
}

const inputs = document.getElementsByTagName("input");
for (let input of inputs) {
    input.addEventListener('change', disableField);
}

/* Máscaras ER */
function mascara(o, f) {
    v_obj = o
    v_fun = f
    setTimeout("execmascara()", 1)
}
function execmascara() {
    v_obj.value = v_fun(v_obj.value)
}
function mcep(v) {
    v = v.replace(/\D/g, "")                    //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d{1,3})$/, "$1-$2")
    return v
}
function mtel(v) {
    v = v.replace(/\D/g, "")                 //Remove tudo o que não é dígito
    v = v.replace(/^(\d\d)(\d)/g, "($1) $2") //Coloca parênteses em volta dos dois primeiros dígitos
    if (v.length > 13) {
        v = v.replace(/(\d{5})(\d)/, "$1-$2")    //Coloca hífen entre o quarto e o quinto dígitos
    } else {
        v = v.replace(/(\d{4})(\d)/, "$1-$2")

    }
    return v
}
function cnpj(v) {
    v = v.replace(/\D/g, "")                           //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/, "$1.$2")             //Coloca ponto entre o segundo e o terceiro dígitos
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") //Coloca ponto entre o quinto e o sexto dígitos
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2")           //Coloca uma barra entre o oitavo e o nono dígitos
    v = v.replace(/(\d{4})(\d)/, "$1-$2")              //Coloca um hífen depois do bloco de quatro dígitos
    return v
}
function mcpf(v) {
    v = v.replace(/\D/g, "")                    //Remove tudo o que não é dígito
    v = v.replace(/(\d{3})(\d)/, "$1.$2")       //Coloca um ponto entre o terceiro e o quarto dígitos
    v = v.replace(/(\d{3})(\d)/, "$1.$2")       //Coloca um ponto entre o terceiro e o quarto dígitos
    //de novo (para o segundo bloco de números)
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2") //Coloca um hífen entre o terceiro e o quarto dígitos
    return v
}
function mdata(v) {
    v = v.replace(/\D/g, "");                    //Remove tudo o que não é dígito
    v = v.replace(/(\d{2})(\d)/, "$1/$2");
    v = v.replace(/(\d{2})(\d)/, "$1/$2");

    v = v.replace(/(\d{2})(\d{2})$/, "$1$2");
    return v;
}
function mtempo(v) {
    v = v.replace(/\D/g, "");                    //Remove tudo o que não é dígito
    v = v.replace(/(\d{1})(\d{2})(\d{2})/, "$1:$2.$3");
    return v;
}
function mhora(v) {
    v = v.replace(/\D/g, "");                    //Remove tudo o que não é dígito
    v = v.replace(/(\d{2})(\d)/, "$1h$2");
    return v;
}
function mrg(v) {
    v = v.replace(/\D/g, "");					//Remove tudo o que não é dígito
    v = v.replace(/(\d)(\d{7})$/, "$1.$2");	//Coloca o . antes dos últimos 3 dígitos, e antes do verificador
    v = v.replace(/(\d)(\d{4})$/, "$1.$2");	//Coloca o . antes dos últimos 3 dígitos, e antes do verificador
    v = v.replace(/(\d)(\d)$/, "$1-$2");		//Coloca o - antes do último dígito
    return v;
}
function mnum(v) {
    v = v.replace(/\D/g, "");					//Remove tudo o que não é dígito
    return v;
}