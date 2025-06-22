export function getStatusColor(status: string): string {
	switch (status) {
		case 'Møtt opp':
			return 'bg-green-100 text-green-800';
		case 'Kommer':
			return 'bg-blue-100 text-blue-800';
		case 'Fravær':
			return 'bg-red-100 text-red-800';
		default:
			return 'bg-gray-100 text-gray-500';
	}
}
