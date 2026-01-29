import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = forwardRef<
	ElementRef<typeof DialogPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity',
			'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
			className
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = forwardRef<
	ElementRef<typeof DialogPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[440px] -translate-x-1/2 -translate-y-1/2',
				'rounded-2xl border border-slate-200 bg-white shadow-xl outline-none',
				'transition-[opacity,transform] data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
				'data-[state=open]:scale-100 data-[state=closed]:scale-95',
				className
			)}
			{...props}
		/>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;
