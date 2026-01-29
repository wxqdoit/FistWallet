import useProvidersStore from "../state/providers";

export const useConnectedProvider = () => {
  const {connectedProvider} = useProvidersStore()
  return {connectedProvider};
};

