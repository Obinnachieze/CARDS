import { Html, Body, Container, Img, Button, Text } from "@react-email/components";

interface BirthdayCardEmailProps {
    memberFullName: string;
    orgName: string;
    cardImageUrl: string;
    cardShareUrl: string;
}

export function BirthdayCardEmail({
    memberFullName,
    orgName,
    cardImageUrl,
    cardShareUrl,
}: BirthdayCardEmailProps) {
    return (
        <Html>
            <Body style={{ fontFamily: "Arial, sans-serif", background: "#f9fafb" }}>
                <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
                    <Text style={{ fontSize: "16px", color: "#333" }}>
                        Hi {memberFullName}, your team at {orgName} is celebrating you today!
                    </Text>
                    <Img
                        src={cardImageUrl}
                        alt="Happy Birthday"
                        width="560"
                        style={{ borderRadius: "8px", marginTop: "16px", marginBottom: "16px" }}
                    />
                    <Button
                        href={cardShareUrl}
                        style={{
                            background: "#10b981",
                            color: "#fff",
                            padding: "12px 24px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            display: "inline-block"
                        }}
                    >
                        View Your Full Card
                    </Button>
                </Container>
            </Body>
        </Html>
    );
}
