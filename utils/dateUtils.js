const formatDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString("it-IT").replace(/\//g, "-");
    const time = now.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${date} ${time}`;
  };
  
  module.exports = { formatDate };
  