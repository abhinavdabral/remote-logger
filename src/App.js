import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";
import JSONView from "react-json-view";
import moment from "moment";

let socket = undefined;
class App extends Component {
  socket = null;
  state = {
    connected: false,
    logs: [],
    groupName: "__public__",
    _groupName: undefined,
    collapsed: true,
    scroll: true
  };
  componentDidMount() {
    const options = {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999,
      secure: true
    };

    socket = io.connect(
      "http://192.168.100.137:7777/",
      options
    );

    socket.on("connect", () => {
      console.log("Connected");
      this.setState({
        connected: true
      });
    });

    socket.on("ACK", (socket_id, joinGroup) => {
      this.state.groupName && joinGroup(this.state.groupName);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      this.setState({
        connected: false
      });
    });

    socket.on("message", message => {
      this.setState({
        logs: [...this.state.logs, { ...message, class: this.getClassName(message.name) }]
      });
    });
  }

  getClassName = name => {
    const type = name.slice(1, name.indexOf("]"));
    console.log(type);
    switch (type) {
      case "SOCKET":
        return "socket";
      case "RESPONSE":
        return "response";
      case "ERROR":
        return "error";
      case "INFO":
        return "info";
      default:
        return "";
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.groupName !== this.state.groupName) {
      this.setState({ logs: [] });
      if (this.state.groupName && socket) {
        socket.emit("join", "_" + this.state.groupName);
      }
    }

    document.title = this.state.groupName || "<NOT-SET>";
  }
  componentWillUnmount() {
    socket.disconnect();
  }
  render() {
    return (
      <div className="App">
        <div className="Header">
          <span>Group {this.state.groupName ? "(" + this.state.groupName + ")" : "<NOT-SET>"}</span>
          <span>
            <input
              type="text"
              onChange={e => {
                this.setState({ _groupName: e.target.value });
              }}
              value={this.state._groupName}
              placeholder="groupname"
            />
          </span>
          <span>
            <button
              onClick={() => {
                this.setState({ groupName: this.state._groupName });
              }}
            >
              SET GROUP
            </button>
          </span>
          <span>
            <input
              type="checkbox"
              onChange={e => {
                this.setState({
                  collapsed: e.target.checked
                });
              }}
              checked={this.state.collapsed}
            />
            <label>Collapsed</label>
          </span>
          <span>
            <input
              type="checkbox"
              onChange={e => {
                this.setState({
                  scroll: e.target.checked
                });
              }}
              checked={this.state.scroll}
            />
            <label>Scroll To Latest</label>
          </span>
          <span>
            <button
              onClick={() => {
                this.setState({ logs: [] });
              }}
            >
              CLEAR
            </button>
          </span>

          <span>
            <button
              onClick={() => {
                var blob = new Blob([JSON.stringify(this.state.logs)], { type: "text/json;charset=utf-8;" });
                var link = document.createElement("a");
                if (link.download !== undefined) {
                  // feature detection
                  // Browsers that support HTML5 download attributequeryDataSet
                  var url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute("download", "log.json");
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
                // this.setState({ logs: [] });
              }}
            >
              SAVE
            </button>
          </span>
          <span>{this.state.connected ? "Connected" : "Disconnected"} </span>
        </div>
        <div className="logContainer">
          <LogBody logs={this.state.logs} collapsed={this.state.collapsed} autoScroll={this.state.scroll} />
        </div>
      </div>
    );
  }
}

class LogBody extends Component {
  messagesEnd = null;
  scrollToBottom = () => {
    this.messagesEnd && this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    if (this.props.autoScroll) this.scrollToBottom();
  }

  render() {
    return (
      <div>
        {this.props.logs.map((log, i) => (
          <div className="row" key={i + ""}>
            <div className={`jsonview ${log.class}`}>
              <JSONView
                name={`${moment(log.timestamp).format("hh:mm:ss.SSS A")} ${log.name}`}
                src={log.data}
                displayObjectSize={false}
                displayDataTypes={false}
                collapsed={this.props.collapsed}
                indentWidth={2}
                key={i + ""}
                theme={"monokai"}
              />
            </div>
          </div>
        ))}
        <div
          style={{ float: "left", clear: "both" }}
          ref={el => {
            this.messagesEnd = el;
          }}
        />
      </div>
    );
  }
}

export default App;
