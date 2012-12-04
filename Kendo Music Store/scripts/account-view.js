define(["jQuery", "kendo", "config", "utils", "account"], function ($, kendo, config, utils, account) {
    var _loginView,
        _submitting = false;
    
    var _clearForms = function() {
        viewModel.set("loginUsername", "");
        viewModel.set("loginPassword", "");
        viewModel.set("registerUsername", "");
        viewModel.set("registerPassword", "");
        viewModel.set("registerPasswordRetyped", "");
    };
    
    var _redirectAfterLogin = function () {
        if(_loginView.params && _loginView.params.navto) {
            utils.navigate("#" +_loginView.params.navto);
            return;
        }
        utils.navigate("#account-view");
    };

    var viewModel = kendo.observable({
        userName: account.userName,
        errorMessage: "",
        loginUsername: "",
        loginPassword: "",
        registerUsername: "",
        registerPassword: "",
        registerPasswordRetyped: "",
        
        login: function (clickEvt) {
            var userName = viewModel.loginUsername;
            var password = viewModel.loginPassword;
            $.post(config.loginUrl, {
                    UserName: userName,
                    Password: password
            })
            .done(function(validCredentials) {
                if (validCredentials) {
                    viewModel.set("userName", userName);
                    account.isAuthenticated = true;
                    account.userName = userName;
                    account.password = password;
                    _redirectAfterLogin();
                } else {
                    utils.showError("Log in failed.");
                }
            })
            .fail(function(error) {
                utils.showError("Log In failed.", error);
            })
            .always(_clearForms);
        },
        
        logout: function (clickEvt) {
            $.post(config.loginUrl)
            .done(function (data) {
                viewModel.set("userName", "");
                account.isAuthenticated = false;
                account.userName = null;
                account.password = null;
                utils.navigate("#login-view");
            })
            .fail(function(error) {
                utils.showError("Log off failed.", error);
            })
            .always(_clearForms);
        },

        register: function (clickEvt) {
            var name = viewModel.registerUsername,
                pwd = viewModel.registerPassword,
                pwd2 = viewModel.registerPasswordRetyped;
            
            if(_submitting) {
                return;
            }
            
            if (name === ""){
                utils.showError("Name must not be empty.");
                return;
            } else if(pwd === "" || pwd !== pwd2) {
                utils.showError("Passwords must match.");
                return;
            }

            _submitting = true;
            $.ajax(config.loginUrl, {
                type: "put",
                data: {
                    UserName: name,
                    Password: pwd
                }
            })
            .done(function(registrationSuccess) {
                _submitting = false;
                if (registrationSuccess) {
                    viewModel.set("userName", name);
                    account.isAuthenticated = true;
                    account.userName = name;
                    account.password = pwd;
                    
                    utils.navigate("#account-view");
                }
            })
            .fail(function(error) {
                _submitting = false;
                utils.showError("Registration failed.", error);
            })
            .always(_clearForms);
        }
    });
    
    return {
        loginInit: function (initEvt) {
            _loginView = initEvt.view;
        },

        beforeShow: function (showEvt) {
            if(!account.isAuthenticated) {
                showEvt.preventDefault();
                utils.navigate("#login-view");
            }
        },

        viewModel: viewModel
    };
});
