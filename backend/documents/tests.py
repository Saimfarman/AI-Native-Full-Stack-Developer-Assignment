from rest_framework.test import APITestCase

from documents.models import DemoUser, Document


class DocumentWorkflowTests(APITestCase):
    def setUp(self):
        self.owner, _ = DemoUser.objects.update_or_create(
            id=1,
            defaults={'display_name': 'Ajaia Owner', 'email': 'owner@ajaia.local'},
        )
        self.teammate, _ = DemoUser.objects.update_or_create(
            id=2,
            defaults={'display_name': 'Ajaia Teammate', 'email': 'teammate@ajaia.local'},
        )
        self.viewer, _ = DemoUser.objects.update_or_create(
            id=3,
            defaults={'display_name': 'Ajaia Reviewer', 'email': 'reviewer@ajaia.local'},
        )

    def auth_headers(self, user):
        return {'HTTP_X_USER_ID': str(user.id)}

    def test_owner_can_create_and_reopen_document(self):
        create_response = self.client.post(
            '/api/documents/',
            {'title': 'Project Notes', 'content_html': '<h1>Intro</h1><p>Hello</p>'},
            format='json',
            **self.auth_headers(self.owner),
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data['title'], 'Project Notes')
        self.assertEqual(create_response.data['content_html'], '<h1>Intro</h1><p>Hello</p>')

        list_response = self.client.get('/api/documents/', **self.auth_headers(self.owner))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['title'], 'Project Notes')
        self.assertEqual(list_response.data[0]['access_role'], 'owned')
        self.assertEqual(list_response.data[0]['owner']['display_name'], 'Ajaia Owner')

    def test_shared_user_can_access_shared_document_but_viewer_cannot(self):
        document = Document.objects.create(
            owner=self.owner,
            title='Shared Draft',
            content_html='<p>Team only</p>',
        )
        document.shared_with.add(self.teammate)

        teammate_response = self.client.get('/api/documents/', **self.auth_headers(self.teammate))
        self.assertEqual(teammate_response.status_code, 200)
        self.assertEqual(len(teammate_response.data), 1)
        self.assertEqual(teammate_response.data[0]['id'], document.id)
        self.assertEqual(teammate_response.data[0]['access_role'], 'shared')
        self.assertTrue(teammate_response.data[0]['can_edit'])

        viewer_response = self.client.get('/api/documents/', **self.auth_headers(self.viewer))
        self.assertEqual(viewer_response.status_code, 200)
        self.assertEqual(viewer_response.data, [])