go.utils = {
    get_user_profile: function(msg) {
        return msg.helper_metadata.messenger || {};
    }
};
