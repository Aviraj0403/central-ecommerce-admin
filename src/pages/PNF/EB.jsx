import React, { Component } from "react";
import { Link } from "react-router-dom";

class EB extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("Error caught by Error Boundary: ", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#fce4ec] to-[#f8bbd0] p-6">
          <img
            src="/gurmeet-kaur-error.png"
            alt="Beauty Products Error"
            className="max-w-[280px] mb-6"
          />
          <h2 className="text-2xl font-extrabold text-[#ad1457] mb-4 font-sans">
            Oops! Something went wrong.
          </h2>
          <p className="text-base text-gray-700 max-w-md mb-6">
            It seems like we’re having a little glitch with our beauty products. No worries—we’re fixing it as quickly as possible!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#ad1457] text-white rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-[#880e4f]"
          >
            Go Back to Store
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EB;
