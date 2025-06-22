import * as React from 'react';
import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Link,
	Button,
	Hr
} from '@react-email/components';

interface MagicLinkEmailProps {
	name: string;
	magicLinkUrl: string;
}

export default function MagicLinkEmail({
	name = 'Andreas Aanes',
	magicLinkUrl = '123'
}: MagicLinkEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Logg inn på Webkom Portalen</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={section}>
						<Text style={heading}>Webkom</Text>
						<Hr style={hr} />

						<Text style={text}>Hei, {name}!</Text>

						<Text style={text}>Klikk linken under for å logge deg på Webkom-portalen:</Text>

						<Section style={buttonContainer}>
							<Button style={button} href={magicLinkUrl}>
								Logg inn
							</Button>
						</Section>

						<Text style={linkText}>Eller kopier og lim inn denne linken i nettleseren din:</Text>
						<Link href={magicLinkUrl} style={link}>
							{magicLinkUrl}
						</Link>

						<Hr style={hr} />
						<Text style={footer}>Denne linken utløper om 24 timer og kan kun brukes én gang.</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
};

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '20px 0 48px',
	marginBottom: '64px'
};

const section = {
	padding: '0 48px'
};

const heading = {
	fontSize: '32px',
	lineHeight: '1.3',
	fontWeight: '700',
	color: '#1f2937',
	textAlign: 'center' as const,
	margin: '0 0 20px'
};

const text = {
	fontSize: '16px',
	lineHeight: '1.4',
	color: '#374151',
	margin: '16px 0'
};

const buttonContainer = {
	textAlign: 'center' as const,
	margin: '32px 0'
};

const button = {
	backgroundColor: '#1f2937',
	borderRadius: '6px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: 'bold',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'block',
	width: '80%',
	margin: '0 auto',
	padding: '12px 32px'
};

const linkText = {
	fontSize: '14px',
	lineHeight: '1.4',
	color: '#6b7280',
	margin: '24px 0 8px'
};

const link = {
	color: '#2563eb',
	textDecoration: 'underline',
	fontSize: '14px',
	wordBreak: 'break-all' as const
};

const hr = {
	borderColor: '#e5e7eb',
	margin: '32px 0'
};

const footer = {
	color: '#6b7280',
	fontSize: '12px',
	lineHeight: '1.4',
	margin: '24px 0 0',
	textAlign: 'center' as const
};
