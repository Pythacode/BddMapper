import * as ContextMenu from "@radix-ui/react-context-menu";
import React from "react";
import './Menu.css'

function Menu({ children, items }) {
    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                {children}
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="context-menu"
                    onPointerDown={function (e) {
                        e.stopPropagation()
                    }}
                >
                    {items.map((item, i) => (
                        <React.Fragment key={i}>
                            {item.separator && <ContextMenu.Separator className="context-menu-separator" />}
                            <ContextMenu.Item onSelect={item.onClick} className="context-menu-item">
                                {item.label}
                            </ContextMenu.Item>
                        </React.Fragment>
                    ))}
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}

export default Menu;