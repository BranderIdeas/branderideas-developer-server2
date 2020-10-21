odoo.define('website.activacion', function(require) {
    'use strict';
        
        const Class = require('web.Class');
        const rpc = require('web.rpc');
        const Validaciones = require('website.validations');
        const validaciones = new Validaciones();
        
        const data = {
            documento: '',
            tipo_doc: ''
        }
            
        const Activacion = Class.extend({ //data, _this
            habilitarBtn: function(campos_validos, id_btn){
                if (campos_validos) {
                    $('#'+id_btn).removeAttr('disabled');
                } else {
                    $('#'+id_btn).attr('disabled', 'disabled');
                }
            },
            validarCaptcha: function(elem, _this){
                grecaptcha.ready(async function() {
                    let result = await grecaptcha.getResponse();
                    if(result != ''){
                        _this.buscar_tramite(result, elem, _this);
                        elem.attr('disabled', 'disabled');
                    }else{
                        elem.removeAttr('disabled');
                        validaciones.mostrar_helper(false,'Por favor, realiza la validación');
                    }
                });
            },
            buscar_tramite: function(token, elem, _this){
                console.log(data);
                rpc.query({
                    route: '/get_profesional',
                    params: {'tipo_doc': data.tipo_doc, 'documento': data.documento, 'token': token}
                }).then(function(response){
                    _this.mostrar_resultado(response, elem, _this);
                }).catch(function(err){
                    console.log(err);
                    console.log('No se ha podido completar su solicitud');
                });
                
            },
            mostrar_resultado: function(response, elem, _this){
                let div_results = $('#msj_result');
                if (response.error_captcha){
                    grecaptcha.reset();
                    return;
                } else if (!response.ok){
                    div_results.removeClass('invisible').attr('aria-hidden',false);
                    let texto = `<h5><i class="fa fa-exclamation-triangle"></i> ${response.result}</h5>
                                 <h5>Por favor envie su solicitud al correo electrónico info@cpnaa.gov.co</h5>`;
                    div_results.find('#data_result').html(texto);
                } else if (response.result && response.result.length > 0){
                    $(location).attr('href','/tramites/solicitud_virtual/'+ response.result[0].id);
                }
            },
            validar_formatos: function(_this){
                data.documento = $('#doc_activacion').val().toUpperCase();
                data.tipo_doc = $('#doc_type_activacion').val();
                $('#doc_activacion').val(data.documento);
                let valido = validaciones.validar_campos_inicial(validaciones, 'doc_activacion', 'doc_type_activacion');
                _this.habilitarBtn(valido, 'btn_sol_virtual');
            }
        })
        
        const activacion = new Activacion();
        
        // Inicio del input tipo de documento
        $('#doc_type_activacion').change(function(e) {
            e.preventDefault();
            activacion.validar_formatos(activacion);
        });
        
        // Inicio del input número de documento
        $('#doc_activacion').on('input', function(e) {
            e.preventDefault();
            activacion.validar_formatos(activacion);
        });
    
        $('#btn_sol_virtual').click(function(e) {
            e.preventDefault();
            activacion.validarCaptcha($('#btn_sol_virtual'), activacion);
        });
          
    })