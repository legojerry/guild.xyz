import { createContext, useEffect, useState } from "react"
import { useWeb3React } from "@web3-react/core"
// eslint-disable-next-line import/no-extraneous-dependencies
import { AbstractConnector } from "@web3-react/abstract-connector"
import { useDisclosure } from "@chakra-ui/react"
import useEagerConnect from "./hooks/useEagerConnect"
import useInactiveListener from "./hooks/useInactiveListener"
import Web3Modal from "./components/Web3Modal"

const Web3Connection = createContext({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  triedEager: false,
})

type Props = {
  children: JSX.Element
}

const Web3ConnectionManager = ({ children }: Props): JSX.Element => {
  const { setError, connector } = useWeb3React()
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure()

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<AbstractConnector>()
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <Web3Connection.Provider
      value={{ isModalOpen, openModal, closeModal, triedEager }}
    >
      {children}
      <Web3Modal
        {...{
          activatingConnector,
          setActivatingConnector,
          isModalOpen,
          closeModal,
        }}
      />
    </Web3Connection.Provider>
  )
}
export { Web3Connection, Web3ConnectionManager }
