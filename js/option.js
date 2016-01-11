
var Select = React.createClass({
  handleOnChange: function (evt) {
    this.props.onChange(evt, this.refs.input.value);
  },
  render: function () {
    var fieldId = this.props.id || this.props.name;
    return React.createElement(
      "div",
      { className: "form-group" },
      React.createElement(
        "label",
        { htmlFor: fieldId },
        this.props.label
      ),
      React.createElement(
        "select",
        { id: fieldId,
          name: this.props.name,
          className: "form-control",
          value: this.props.value,
          ref: "input",
          onChange: this.handleOnChange },
        React.createElement("option", null),
        this.props.options instanceof Array && this.props.options.map(option => {
          if (typeof option == 'string') return React.createElement(
            "option",
            { value: option },
            option
          );else return React.createElement(
            "option",
            { value: option.value },
            option.label
          );
        })
      )
    );
  }
});

var TextField = React.createClass({
  handleOnChange: function (evt) {
    this.props.onChange(evt, this.refs.input.value);
  },
  render: function () {
    var fieldId = this.props.id || this.props.name;
    return React.createElement(
      "div",
      { className: "form-group" },
      React.createElement(
        "label",
        { htmlFor: fieldId },
        this.props.label
      ),
      React.createElement("input", { id: fieldId,
        name: this.props.name,
        className: "form-control",
        type: "text",
        value: this.props.value,
        placeholder: this.props.placeholder,
        ref: "input",
        onChange: this.handleOnChange })
    );
  }
});

var Password = React.createClass({
  handleOnChange: function (evt) {
    this.props.onChange(evt, this.refs.input.value);
  },
  render: function () {
    var fieldId = this.props.id || this.props.name;
    return React.createElement(
      "div",
      { className: "form-group" },
      React.createElement(
        "label",
        { htmlFor: fieldId },
        this.props.label
      ),
      React.createElement("input", { id: fieldId,
        name: this.props.name,
        className: "form-control",
        type: "password",
        value: this.props.value,
        placeholder: this.props.placeholder,
        ref: "input",
        onChange: this.handleOnChange })
    );
  }
});

var AnkiAccountPanel = React.createClass({
  getInitialState: function () {
    return {
      error: false,
      disabled: false,
      decks: []
    };
  },
  getDesks: function (accountInfo) {
    if (this.props.username && this.props.password) {
      this.setState({
        error: false,
        disabled: true,
        decks: []
      });
      ajax('https://ankiweb.net/account/logout', 'get').then((function () {
        return ajax('https://ankiweb.net/account/login', 'post', { 'Content-Type': 'application/x-www-form-urlencoded' }, this.props);
      }).bind(this)).then((function (resp) {
        var result = new DOMParser().parseFromString(resp.response, "text/html").getElementsByClassName('warning')[0];
        if (!result) return ajax('https://ankiweb.net/decks/', 'get');else throw resp.innerHtml;
      }).bind(this)).then((function (resp) {
        this.setState({
          error: false,
          disabled: false,
          decks: Array.prototype.slice.call(new DOMParser().parseFromString(resp.response, "text/html").getElementsByClassName('deck')).map(ele => ele.innerText.trim())
        });
      }).bind(this)).catch((function printErr(err) {
        this.setState({
          error: true,
          disabled: false,
          decks: []
        });
        console.log(err);
      }).bind(this));
    }
  },
  componentWillMount: function () {
    this.getDesks();
  },
  refreshDesksTaskId: 0,
  componentWillReceiveProps: function (nextProps) {
    clearTimeout(this.refreshDesksTaskId);
    this.refreshDesksTaskId = setTimeout(this.getDesks.bind(this), 1000);
  },
  handleOnChange: function (evt, value) {
    this.props.onChange(evt, value);
  },
  render: function () {
    return React.createElement(
      "fieldset",
      { disabled: this.state.disabled },
      React.createElement(TextField, { name: "username",
        label: "Email",
        className: "col-sm-4",
        value: this.props.username,
        placeholder: "Email",
        onChange: this.handleOnChange }),
      React.createElement(Password, { name: "password",
        label: "Password",
        className: "col-sm-4",
        value: this.props.password,
        placeholder: "Anki Password",
        onChange: this.handleOnChange }),
      React.createElement(Select, { name: "deck",
        label: "Deck",
        className: "col-sm-4",
        value: this.props.deck,
        options: this.state.decks,
        onChange: this.handleOnChange }),
      this.state.error ? React.createElement(
        "p",
        null,
        this.state.error
      ) : ''
    );
  }
});

var ConfigForm = React.createClass({
  getInitialState: function () {
    return {
      langMap: [],
      config: Object.assign({
        nativeTongue: navigator.language,
        username: '',
        password: '',
        deck: ''
      }, this.props.config)
    };
  },
  componentWillMount: function () {
    ajax('./lang.json', 'get').then((function (data) {
      this.setState({ langMap: JSON.parse(data.response) });
    }).bind(this));
  },
  handleChange: function (evt, value) {
    this.state.config[evt.target.id] = value;
    this.setState(this.state);
  },
  handleSubmit: function (evt) {
    chrome.storage.sync.set({ config: this.state.config });
  },
  render: function () {
    return React.createElement(
      "form",
      { className: "container", onSubmit: this.handleSubmit },
      React.createElement(Select, { name: "nativeTongue",
        label: "Native Tongue",
        value: this.state.config.nativeTongue,
        options: this.state.langMap,
        onChange: this.handleChange }),
      React.createElement(AnkiAccountPanel, {
        username: this.state.config.username,
        password: this.state.config.password,
        deck: this.state.config.deck,
        onChange: this.handleChange }),
      React.createElement("hr", null),
      React.createElement(
        "button",
        { type: "submit", className: "pull-right btn btn-primary" },
        "Submit"
      )
    );
  }
});

// chrome.storage.sync.get( ["config"], function loadDict( items ) {
// 	var config = items.config||{ username:123, password:456};
//   var setter = {
//     setNativeTongue: function ( val ) { config.nativeTongue = val },
//     setUserName: function ( val ) { config.username = val },
//     setPassword: function ( val ) { config.password = val },
//     setDeck: function ( val ) { config.deck = val }
//   }
//
// } );

chrome.storage.sync.get(["config"], function loadDict(items) {
  ReactDOM.render(React.createElement(ConfigForm, { config: items.config }), document.getElementById('config'));
});
