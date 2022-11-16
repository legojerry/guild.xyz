import {
  Collapse,
  Icon,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react"
import CopyableAddress from "components/common/CopyableAddress"
import { CaretDown } from "phosphor-react"
import { RequirementComponentProps } from "requirements"
import Requirement from "../common/Requirement"
import { RequirementButton } from "../common/RequirementButton"

const SnapshotRequirement = ({
  requirement,
  ...rest
}: RequirementComponentProps): JSX.Element => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Requirement
      image="/requirementLogos/snapshot.png"
      footer={
        <>
          <RequirementButton
            rightIcon={
              <Icon
                as={CaretDown}
                transform={isOpen && "rotate(-180deg)"}
                transition="transform .3s"
              />
            }
            onClick={onToggle}
          >
            View parameters
          </RequirementButton>
          <Collapse in={isOpen}>
            <Table
              variant="simple"
              w="full"
              sx={{ tableLayout: "fixed", borderCollapse: "unset" }}
              size="sm"
              bg="blackAlpha.100"
              borderWidth="1px"
              borderRadius="md"
            >
              <Thead>
                <Tr>
                  <Th>Param</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>
              <Tbody fontWeight="normal" fontSize="xs">
                {Object.entries(requirement.data?.strategy?.params || {})?.map(
                  ([name, value]) => (
                    <Tr key={name}>
                      <Td>{name}</Td>
                      <Td>
                        {value?.toString()?.startsWith("0x") ? (
                          <CopyableAddress
                            address={value.toString()}
                            fontWeight="normal"
                            fontSize="xs"
                          />
                        ) : (
                          value?.toString()
                        )}
                      </Td>
                    </Tr>
                  )
                )}
              </Tbody>
            </Table>
          </Collapse>
        </>
      }
      {...rest}
    >
      {`Satisfy the ${requirement.data?.strategy?.name} snapshot strategy`}
    </Requirement>
  )
}

export default SnapshotRequirement