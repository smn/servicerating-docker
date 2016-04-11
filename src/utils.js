var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var _ = require('lodash');

go.states = {
    MessengerChoiceState: ChoiceState.extend(function(self, name, opts) {
        /*
        Automatically add the necessary helper metadata for
        ChoiceStates when using the Messenger transport
        */

        opts = _.defaults(opts || {}, {
            helper_metadata: function () {
                var i18n = self.im.user.i18n;
                return {
                    messenger: {
                        template_type: 'generic',
                        title: i18n(opts.title),
                        subtitle: i18n(opts.question),
                        image_url: opts.image_url || '',
                        buttons: opts.choices.map(function(choice, index) {
                            return {
                                title: i18n(choice.label),
                                payload: {
                                    content: (index + 1) + '',
                                    in_reply_to: self.im.msg.message_id || null,
                                }
                            };
                        })
                    }
                };
            }
        });

        ChoiceState.call(self, name, opts);

    }),

    "trailing": "comma"
};

go.utils = {
    get_user_profile: function(msg) {
        return msg.helper_metadata.messenger || {};
    }
};
