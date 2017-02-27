export default (o, path) => path.reduce((result, property) => result[property], o);
