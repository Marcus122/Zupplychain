exports.config = {
    db_config: {
        host: "localhost",
        // use default "port"
        poolSize: 20,
		database:"ZupplyChain"
    },
	cookie_config: {
		maxAge: 900000,
		httpOnly:false,
		secure:false
	},

    static_content: "../static/"
};